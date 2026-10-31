const axios = require('axios');
const app = require('../src/app');
const env = require('../src/config/env');
const prisma = require('../src/config/prisma');

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log('🧪 STARTING RAILBUS COMPREHENSIVE AUTOMATED TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // Start temporary test server
  const testPort = 5099;
  const server = app.listen(testPort);
  const baseURL = `http://localhost:${testPort}/api`;
  const client = axios.create({ baseURL, validateStatus: () => true });

  try {
    // -------------------------------------------------------------
    // 1. HEALTH CHECK
    // -------------------------------------------------------------
    console.log('--- Phase 1: API Gateway Health Check ---');
    const healthRes = await client.get('/health');
    assert(healthRes.status === 200 && healthRes.data.status === 'ONLINE', 'System Health Check Online');

    // -------------------------------------------------------------
    // 2. AUTHENTICATION & DEMO ACCOUNTS
    // -------------------------------------------------------------
    console.log('\n--- Phase 2: Role-Separated Authentication ---');
    // Admin Login
    const adminLoginRes = await client.post('/auth/admin/login', {
      email: 'admin@railbus.demo',
      password: 'RailBus@Admin2026'
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.data.token, 'Seeded Admin Login (admin@railbus.demo)');
    assert(adminLoginRes.data.user?.role === 'ADMIN', 'Admin User Role is strictly ADMIN');
    const adminToken = adminLoginRes.data.token;

    // Conductor Login
    const conductorLoginRes = await client.post('/auth/conductor/login', {
      email: 'conductor@railbus.demo',
      password: 'Conductor@2026'
    });
    assert(conductorLoginRes.status === 200 && conductorLoginRes.data.token, 'Seeded Conductor Login (conductor@railbus.demo)');
    assert(conductorLoginRes.data.user?.role === 'CONDUCTOR', 'Conductor User Role is strictly CONDUCTOR');
    const conductorToken = conductorLoginRes.data.token;

    // Passenger Login
    const passengerLoginRes = await client.post('/auth/passenger/login', {
      email: 'passenger@railbus.demo',
      password: 'Passenger@2026'
    });
    assert(passengerLoginRes.status === 200 && passengerLoginRes.data.token, 'Seeded Passenger Login (passenger@railbus.demo)');
    assert(passengerLoginRes.data.user?.role === 'PASSENGER', 'Passenger User Role is strictly PASSENGER');
    const passengerToken = passengerLoginRes.data.token;

    // -------------------------------------------------------------
    // 3. SECURITY & ROLE ISOLATION BOUNDARY CHECKS
    // -------------------------------------------------------------
    console.log('\n--- Phase 3: Security & Role Boundary Enforcement ---');
    // Test: Passenger calls admin dashboard
    const passToAdminRes = await client.get('/admin/dashboard', {
      headers: { Authorization: `Bearer ${passengerToken}` }
    });
    assert(passToAdminRes.status === 403, 'Passenger Forbidden from Admin Dashboard (HTTP 403)');

    // Test: Passenger calls admin users
    const passToUsersRes = await client.get('/admin/users', {
      headers: { Authorization: `Bearer ${passengerToken}` }
    });
    assert(passToUsersRes.status === 403, 'Passenger Forbidden from Admin User Directory (HTTP 403)');

    // Test: Conductor calls admin dashboard
    const condToAdminRes = await client.get('/admin/dashboard', {
      headers: { Authorization: `Bearer ${conductorToken}` }
    });
    assert(condToAdminRes.status === 403, 'Conductor Forbidden from Admin Dashboard (HTTP 403)');

    // Test: Unauthenticated calls protected endpoint
    const unauthRes = await client.get('/admin/dashboard');
    assert(unauthRes.status === 401, 'Unauthenticated Request Denied (HTTP 401)');

    // Test: Registration injection prevention (cannot register as ADMIN)
    const testEmail = `pax_${Date.now()}@test.com`;
    const regRes = await client.post('/auth/passenger/register', {
      name: 'Security Test User',
      email: testEmail,
      phone: `999${Date.now().toString().slice(-7)}`,
      password: 'Password@123',
      role: 'ADMIN' // Malicious role injection attempt
    });
    assert(regRes.status === 201 && regRes.data.user.role === 'PASSENGER', 'Malicious Role Injection Ignored (Enforced PASSENGER)');

    // -------------------------------------------------------------
    // 4. CATALOG & INTERCHANGE ENDPOINTS
    // -------------------------------------------------------------
    console.log('\n--- Phase 4: Public Catalog & Real-Time Interchange ---');
    const trainsRes = await client.get('/passenger/trains');
    assert(trainsRes.status === 200 && trainsRes.data.trains.length >= 6, 'Fetched Supported Mysuru Inbound Trains');

    const destRes = await client.get('/passenger/destinations');
    assert(destRes.status === 200 && destRes.data.destinations.length >= 8, 'Fetched Active Mysuru Destinations with GPS');

    const routesRes = await client.get('/passenger/routes');
    assert(routesRes.status === 200 && routesRes.data.routes.length >= 5, 'Fetched Verified Transit Corridors & Stops');

    // -------------------------------------------------------------
    // 5. BOOKING & DYNAMIC POOLING RULES (20–56 CAP)
    // -------------------------------------------------------------
    console.log('\n--- Phase 5: Booking, Payments & Pooling Engine ---');
    const train = trainsRes.data.trains[0];
    const destination = destRes.data.destinations[0];

    const createBookingRes = await client.post(
      '/passenger/bookings',
      {
        trainId: train.id,
        destinationId: destination.id,
        journeyDate: new Date().toISOString().split('T')[0],
        passengerCount: 2
      },
      { headers: { Authorization: `Bearer ${passengerToken}` } }
    );
    assert(createBookingRes.status === 201 && createBookingRes.data.booking, 'Created Inbound Booking');
    const booking = createBookingRes.data.booking;

    // Confirm Payment & Join Pool
    const confirmPaymentRes = await client.post(
      '/passenger/bookings/confirm-payment',
      {
        bookingId: booking.id,
        razorpayPaymentId: `pay_test_${Date.now()}`,
        razorpaySignature: 'mock_sig_valid'
      },
      { headers: { Authorization: `Bearer ${passengerToken}` } }
    );
    assert(confirmPaymentRes.status === 200 && confirmPaymentRes.data.ticket, 'Payment Verified & Ticket Generated');
    assert(confirmPaymentRes.data.ticket.sixDigitCode.length === 6, 'Generated 6-Digit Manual Validation Code');
    assert(confirmPaymentRes.data.ticket.qrToken.startsWith('QR_'), 'Generated Secure QR Token');
    const issuedTicket = confirmPaymentRes.data.ticket;

    // -------------------------------------------------------------
    // 6. CONDUCTOR VALIDATION & ATOMIC SCAN
    // -------------------------------------------------------------
    console.log('\n--- Phase 6: Conductor Atomic Boarding Validation ---');
    // 1. Valid 6-digit code validation
    const manualValRes = await client.post(
      '/conductor/validate-manual',
      { sixDigitCode: issuedTicket.sixDigitCode },
      { headers: { Authorization: `Bearer ${conductorToken}` } }
    );
    assert(manualValRes.status === 200 && manualValRes.data.status === 'SUCCESS', 'Conductor Validated 6-Digit Code (Boarding Confirmed)');

    // 2. Duplicate scan attempt (must be rejected!)
    const duplicateScanRes = await client.post(
      '/conductor/validate-manual',
      { sixDigitCode: issuedTicket.sixDigitCode },
      { headers: { Authorization: `Bearer ${conductorToken}` } }
    );
    assert(duplicateScanRes.status === 400 && duplicateScanRes.data.status === 'DUPLICATE', 'Duplicate Scan Rejected (HTTP 400 DUPLICATE)');

    // -------------------------------------------------------------
    // 7. ADMIN COMMAND CENTER OPERATIONS
    // -------------------------------------------------------------
    console.log('\n--- Phase 7: Admin Command Center Operations ---');
    const adminDashboardRes = await client.get('/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminDashboardRes.status === 200 && adminDashboardRes.data.metrics.totalBookings > 0, 'Admin Dashboard Real Database Metrics Verified');

    // Update Train delay
    const updateTrainRes = await client.patch(
      `/admin/trains/${train.id}`,
      { delayMinutes: 18, status: 'DELAYED' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(updateTrainRes.status === 200 && updateTrainRes.data.train.delayMinutes === 18, 'Admin Updated Train Delay Telemetry');

    // Admin Reports CSV export
    const reportsRes = await client.get('/admin/reports?reportType=bookings', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(reportsRes.status === 200 && reportsRes.data.rows.length > 0, 'Generated Operational Report Data');

    // -------------------------------------------------------------
    // 8. MULTI-TRAIN SYNC, NOTIFICATIONS & REFUND SUITE
    // -------------------------------------------------------------
    console.log('\n--- Phase 8: Multi-Train Sync, Notification & Refund Operations ---');
    // Multi-Train Sync API
    const syncRes = await client.get('/passenger/trains/multi-sync');
    assert(syncRes.status === 200 && syncRes.data.syncGroups.length > 0, 'Cross-Platform Multi-Train Sync Matrix Computed');

    // Simulate Notification
    const notifRes = await client.post(
      '/passenger/notifications/simulate',
      { type: 'BUS_NEARBY', busNumber: 'KA-09-F-4412', destinationName: 'Kuvempunagar' },
      { headers: { Authorization: `Bearer ${passengerToken}` } }
    );
    assert(notifRes.status === 201 && notifRes.data.notification.title.includes('Nearby'), 'Generated Bus Nearby Notification');

    // Passenger Instant Refund Processing
    const refundRes = await client.post(
      `/passenger/bookings/${booking.id}/refund`,
      { reason: 'Feeder bus cancelled due to schedule disruption' },
      { headers: { Authorization: `Bearer ${passengerToken}` } }
    );
    assert(refundRes.status === 200 && refundRes.data.booking.paymentStatus === 'REFUNDED', 'Passenger 100% Instant Refund Processed');
    assert(refundRes.data.refundCode.startsWith('RFND-MYS-'), 'Generated Official Refund Reference Code');

    console.log('\n===============================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================\n');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTestSuite();
