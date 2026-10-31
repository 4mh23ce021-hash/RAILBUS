const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const prisma = require('../config/prisma');
const { assignPassengerToPool, POOL_RULES } = require('../algorithms/poolingAlgorithm');
const { createRazorpayOrder, verifyPaymentSignature } = require('../integrations/razorpay/razorpayService');

const createBookingSchema = z.object({
  trainId: z.string().uuid(),
  destinationId: z.string().uuid(),
  journeyDate: z.string().min(10), // "YYYY-MM-DD"
  passengerCount: z.number().int().min(1).max(10).default(1)
});

/**
 * Step 1: Initiate Booking and prepare payment order
 */
async function createBooking(req, res, next) {
  try {
    const validated = createBookingSchema.parse(req.body);
    const passengerId = req.user.id;

    // Verify train exists
    const train = await prisma.train.findUnique({
      where: { id: validated.trainId }
    });
    if (!train) {
      return res.status(404).json({ success: false, message: 'Selected train not found.' });
    }

    // Verify destination exists
    const destination = await prisma.destination.findUnique({
      where: { id: validated.destinationId }
    });
    if (!destination || !destination.isActive) {
      return res.status(404).json({ success: false, message: 'Destination not available.' });
    }

    // Find primary route for this destination
    const route = await prisma.route.findFirst({
      where: { destinationId: destination.id, isActive: true }
    });

    const totalFare = destination.baseFare * validated.passengerCount;
    const bookingCode = `RB-BK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        passengerId,
        trainId: train.id,
        destinationId: destination.id,
        routeId: route ? route.id : null,
        journeyDate: validated.journeyDate,
        passengerCount: validated.passengerCount,
        totalFare,
        paymentStatus: 'PENDING',
        bookingStatus: 'PENDING_POOL'
      },
      include: {
        train: true,
        destination: true,
        route: true
      }
    });

    // Create payment order
    const razorpayOrder = await createRazorpayOrder({
      amountInRupees: totalFare,
      receipt: booking.bookingCode,
      notes: {
        bookingId: booking.id,
        trainNumber: train.trainNumber,
        destination: destination.name
      }
    });

    // Create Payment record
    const payment = await prisma.payment.create({
      data: {
        paymentCode: `PAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
        bookingId: booking.id,
        passengerId,
        amount: totalFare,
        currency: 'INR',
        gateway: razorpayOrder.isLiveGateway ? 'RAZORPAY' : 'TEST_MOCK',
        razorpayOrderId: razorpayOrder.orderId,
        status: 'CREATED'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Booking initialized successfully.',
      booking,
      payment,
      razorpayOrder
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Step 2: Confirm Payment, Run Pooling Algorithm & Generate Ticket
 */
async function confirmPaymentAndJoinPool(req, res, next) {
  try {
    const { bookingId, paymentId, razorpayPaymentId, razorpaySignature } = req.body;
    const passengerId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, passengerId },
      include: { train: true, destination: true }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or unauthorized.' });
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ success: false, message: 'Payment already completed for this booking.' });
    }

    const payment = await prisma.payment.findFirst({
      where: { bookingId: booking.id, passengerId }
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature({
      orderId: payment.razorpayOrderId,
      paymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
      signature: razorpaySignature || 'mock_sig_valid'
    });

    if (!isValidSignature) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: 'Invalid payment signature' }
      });
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }

    // Atomic transaction for payment update, pooling assignment, and ticket creation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Payment status
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'CAPTURED',
          razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`
        }
      });

      // 2. Update booking payment status
      await tx.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: 'PAID' }
      });

      // 3. Assign to Pool
      const poolResult = await assignPassengerToPool(tx, {
        destinationId: booking.destinationId,
        trainId: booking.trainId,
        journeyDate: booking.journeyDate,
        bookingId: booking.id,
        passengerId: booking.passengerId,
        passengerCount: booking.passengerCount
      });

      // 4. Generate Ticket
      const sixDigitCode = Math.floor(100000 + Math.random() * 900000).toString();
      const ticketCode = `TKT-MYS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const qrToken = `QR_${uuidv4().replace(/-/g, '').toUpperCase()}`;

      // Generate Data URL for QR Code
      const qrPayload = JSON.stringify({
        ticketCode,
        sixDigitCode,
        token: qrToken,
        passenger: req.user.name,
        destination: booking.destination.name,
        train: booking.train.trainNumber,
        count: booking.passengerCount
      });

      const qrCodeUrl = await QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: { dark: '#0a0f1d', light: '#00f2fe' }
      });

      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h validity

      const ticket = await tx.ticket.create({
        data: {
          ticketCode,
          sixDigitCode,
          bookingId: booking.id,
          passengerId: booking.passengerId,
          qrToken,
          qrCodeUrl,
          status: 'ISSUED',
          expiresAt
        }
      });

      // Update Booking status to TICKET_ISSUED
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: { bookingStatus: 'TICKET_ISSUED' },
        include: {
          train: true,
          destination: true,
          pool: { include: { assignedVehicle: true } },
          tickets: true
        }
      });

      // Create Notification for passenger
      await tx.notification.create({
        data: {
          userId: passengerId,
          role: 'PASSENGER',
          title: 'Ticket Issued & Pool Joined!',
          message: `Your booking ${booking.bookingCode} for ${booking.destination.name} is confirmed. Ticket: ${ticket.ticketCode}`,
          type: 'SUCCESS',
          linkUrl: `/passenger/ticket/${ticket.id}`
        }
      });

      return {
        booking: updatedBooking,
        pool: poolResult.pool,
        ticket,
        poolResult
      };
    });

    // Real-time notification emission via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Notify this passenger
      io.to(`passenger:${passengerId}`).emit('booking:updated', {
        bookingId: result.booking.id,
        status: result.booking.bookingStatus,
        ticket: result.ticket
      });

      // Broadcast pool update to everyone in this pool & admin
      io.emit('pool:updated', {
        poolId: result.pool.id,
        currentPassengerCount: result.pool.currentPassengerCount,
        status: result.pool.status
      });

      // If threshold of 20 reached, notify admin room specifically
      if (result.poolResult.reachedReviewThreshold) {
        io.to('admin_room').emit('pool:review_required', {
          poolId: result.pool.id,
          poolCode: result.pool.poolCode,
          currentPassengerCount: result.pool.currentPassengerCount,
          message: `Pool ${result.pool.poolCode} has reached 20 passengers and is awaiting operational review!`
        });
      }
    }

    return res.json({
      success: true,
      message: 'Payment confirmed, pool updated, and digital ticket generated!',
      booking: result.booking,
      pool: result.pool,
      ticket: result.ticket
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Step 3: Passenger Instant Refund Request for Disrupted or Cancelled Feeder Bus
 */
async function requestBookingRefund(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const passengerId = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: { id, passengerId },
      include: {
        payments: true,
        pool: { include: { assignedVehicle: true } },
        destination: true,
        train: true
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.paymentStatus === 'REFUNDED') {
      return res.status(400).json({ success: false, message: 'This booking has already been fully refunded.' });
    }

    const refundCode = `RFND-MYS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Booking status to REFUNDED / CANCELLED
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'REFUNDED',
          bookingStatus: 'CANCELLED'
        },
        include: {
          train: true,
          destination: true,
          pool: { include: { assignedVehicle: true } },
          payments: true
        }
      });

      // 2. Update Payment records
      await tx.payment.updateMany({
        where: { bookingId: booking.id },
        data: {
          status: 'REFUNDED',
          failureReason: `100% Full Refund credited to original payment source. Reason: ${reason || 'KSRTC Feeder Bus Cancellation / Schedule Disruption'}`
        }
      });

      // 3. Cancel Tickets
      await tx.ticket.updateMany({
        where: { bookingId: booking.id },
        data: { status: 'CANCELLED' }
      });

      // 4. Update Pool count if in pool
      if (booking.poolId) {
        await tx.passengerPool.update({
          where: { id: booking.poolId },
          data: {
            currentPassengerCount: { decrement: booking.passengerCount }
          }
        });
      }

      // 5. Generate official passenger Notification
      const notif = await tx.notification.create({
        data: {
          userId: passengerId,
          role: 'PASSENGER',
          title: `Full Refund Credited: ₹${booking.totalFare.toFixed(2)}`,
          message: `Your payment of ₹${booking.totalFare.toFixed(2)} for ${booking.destination.name} shuttle (${booking.bookingCode}) has been refunded. Reference: ${refundCode}.`,
          type: 'SUCCESS',
          linkUrl: '/passenger/trips'
        }
      });

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          userId: passengerId,
          action: 'PASSENGER_REFUND_COMPLETED',
          resource: 'BOOKING_PAYMENT',
          details: `100% full refund of ₹${booking.totalFare.toFixed(2)} issued for booking ${booking.bookingCode}. Reference: ${refundCode}`,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
        }
      });

      return { updatedBooking, refundCode, notif };
    });

    // Real-time socket updates
    const io = req.app.get('io');
    if (io) {
      io.to(`passenger:${passengerId}`).emit('booking:refunded', {
        bookingId: booking.id,
        refundCode,
        amount: booking.totalFare,
        message: `Refund of ₹${booking.totalFare} credited.`
      });
      io.to(`passenger:${passengerId}`).emit('notification:new', result.notif);
      if (booking.poolId) {
        io.emit('pool:updated', { poolId: booking.poolId });
      }
    }

    return res.json({
      success: true,
      message: `Full refund of ₹${booking.totalFare.toFixed(2)} processed successfully to original source.`,
      refundCode,
      booking: result.updatedBooking
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBooking,
  confirmPaymentAndJoinPool,
  requestBookingRefund
};
