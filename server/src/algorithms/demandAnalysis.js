const prisma = require('../config/prisma');

/**
 * Computes live operational demand analytics across all destinations,
 * trains, pooling success rates, and fleet utilization.
 */
async function computeDemandAnalytics() {
  const [
    destinations,
    trains,
    pools,
    bookings,
    vehicles,
    tickets
  ] = await Promise.all([
    prisma.destination.findMany({
      include: {
        _count: {
          select: { bookings: true, passengerPools: true }
        }
      }
    }),
    prisma.train.findMany({
      include: {
        _count: {
          select: { bookings: true, passengerPools: true }
        }
      }
    }),
    prisma.passengerPool.findMany({
      include: {
        destination: true,
        train: true
      }
    }),
    prisma.booking.findMany(),
    prisma.vehicle.findMany(),
    prisma.ticket.findMany()
  ]);

  // 1. Destination demand distribution
  const destinationDemand = destinations.map(d => {
    const destBookings = bookings.filter(b => b.destinationId === d.id);
    const totalPassengers = destBookings.reduce((sum, b) => sum + b.passengerCount, 0);
    return {
      destinationId: d.id,
      name: d.name,
      slug: d.slug,
      bookingCount: destBookings.length,
      passengerCount: totalPassengers,
      activePools: pools.filter(p => p.destinationId === d.id && ['FORMING', 'ELIGIBLE_FOR_REVIEW'].includes(p.status)).length
    };
  }).sort((a, b) => b.passengerCount - a.passengerCount);

  // 2. Train-wise demand
  const trainDemand = trains.map(t => {
    const trainBookings = bookings.filter(b => b.trainId === t.id);
    const totalPassengers = trainBookings.reduce((sum, b) => sum + b.passengerCount, 0);
    return {
      trainId: t.id,
      trainNumber: t.trainNumber,
      trainName: t.trainName,
      status: t.status,
      delayMinutes: t.delayMinutes,
      bookingCount: trainBookings.length,
      passengerCount: totalPassengers
    };
  });

  // 3. Pool formation performance
  const totalPools = pools.length;
  const formingPools = pools.filter(p => p.status === 'FORMING').length;
  const eligiblePools = pools.filter(p => p.status === 'ELIGIBLE_FOR_REVIEW').length;
  const approvedPools = pools.filter(p => p.status === 'APPROVED').length;
  const fullPools = pools.filter(p => p.status === 'FULL').length;
  const dispatchedPools = pools.filter(p => p.status === 'DISPATCHED' || p.status === 'COMPLETED').length;

  const poolSuccessRate = totalPools > 0
    ? Math.round(((approvedPools + dispatchedPools + fullPools) / totalPools) * 100)
    : 100;

  // 4. Boarding statistics
  const totalTickets = tickets.length;
  const boardedTickets = tickets.filter(t => t.status === 'BOARDED').length;
  const boardingRate = totalTickets > 0 ? Math.round((boardedTickets / totalTickets) * 100) : 0;

  // 5. Vehicle availability
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const totalVehicles = vehicles.length;

  return {
    summary: {
      totalBookings: bookings.length,
      totalPassengers: bookings.reduce((sum, b) => sum + b.passengerCount, 0),
      totalPools,
      formingPools,
      eligiblePools,
      approvedPools,
      fullPools,
      dispatchedPools,
      poolSuccessRate,
      availableVehicles,
      totalVehicles,
      totalTickets,
      boardedTickets,
      boardingRate
    },
    destinationDemand,
    trainDemand
  };
}

module.exports = {
  computeDemandAnalytics
};
