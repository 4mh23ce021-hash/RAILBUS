const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting RAILBUS database seeding...');

  // 1. Seed Demo Admin Account
  const adminEmail = process.env.DEMO_ADMIN_EMAIL || 'admin@railbus.demo';
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD || 'RailBus@Admin2026';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashedAdminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      name: 'Mysuru Mobility Controller'
    },
    create: {
      email: adminEmail,
      passwordHash: hashedAdminPassword,
      name: 'Mysuru Mobility Controller',
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+918212411001',
      adminProfile: {
        create: {
          department: 'KSRTC Railway-Bus Integration Operations',
          accessLevel: 'SUPER_ADMIN'
        }
      }
    }
  });
  console.log(`✅ Admin account seeded: ${admin.email}`);

  // 2. Seed Conductor Account
  const conductorEmail = 'conductor@railbus.demo';
  const conductorPassword = 'Conductor@2026';
  const hashedConductorPassword = await bcrypt.hash(conductorPassword, 12);

  const conductor = await prisma.user.upsert({
    where: { email: conductorEmail },
    update: {
      passwordHash: hashedConductorPassword,
      role: 'CONDUCTOR',
      status: 'ACTIVE'
    },
    create: {
      email: conductorEmail,
      passwordHash: hashedConductorPassword,
      name: 'Suresh B. Gowda',
      phone: '+919448123456',
      role: 'CONDUCTOR',
      status: 'ACTIVE',
      conductorProfile: {
        create: {
          employeeId: 'KSRTC-MYS-8821',
          badgeNumber: 'BDG-5409',
          assignedBusId: 'KA-09-F-4412'
        }
      }
    }
  });
  console.log(`✅ Conductor account seeded: ${conductor.email}`);

  // 3. Seed Demo Passenger Account
  const passengerEmail = 'passenger@railbus.demo';
  const passengerPassword = 'Passenger@2026';
  const hashedPassengerPassword = await bcrypt.hash(passengerPassword, 12);

  const passenger = await prisma.user.upsert({
    where: { email: passengerEmail },
    update: {
      passwordHash: hashedPassengerPassword,
      role: 'PASSENGER',
      status: 'ACTIVE'
    },
    create: {
      email: passengerEmail,
      passwordHash: hashedPassengerPassword,
      name: 'Ananya Rao',
      phone: '+919876543210',
      role: 'PASSENGER',
      status: 'ACTIVE',
      passengerProfile: {
        create: {
          preferredLanguage: 'en',
          emergencyContact: '+919876500000'
        }
      }
    }
  });
  console.log(`✅ Passenger account seeded: ${passenger.email}`);

  // 4. Seed Boarding Points at Mysuru Junction
  const boardingPoints = [
    {
      name: 'KSRTC City Connector Bay 3',
      stationName: 'Mysuru Junction (MYS)',
      bayNumber: 'Bay 3',
      instructions: 'Exit main railway portico, turn left 60 meters towards KSRTC City Interchange Platform 3.',
      latitude: 12.3164,
      longitude: 76.6433
    },
    {
      name: 'KSRTC Express Shuttle Bay 4',
      stationName: 'Mysuru Junction (MYS)',
      bayNumber: 'Bay 4',
      instructions: 'Located opposite Station Exit Gate 2 directly facing the Pre-Paid Mobility Booth.',
      latitude: 12.3168,
      longitude: 76.6438
    }
  ];

  for (const bp of boardingPoints) {
    const existing = await prisma.boardingPoint.findFirst({ where: { name: bp.name } });
    if (!existing) {
      await prisma.boardingPoint.create({ data: bp });
    }
  }
  console.log('✅ Boarding points seeded');

  // 5. Seed Real Mysuru Trains
  const trainsData = [
    {
      trainNumber: '12008',
      trainName: 'Shatabdi Express',
      sourceStation: 'MGR Chennai Central (MAS)',
      destinationStation: 'Mysuru Junction (MYS)',
      scheduledArrival: '13:00',
      estimatedArrival: '13:00',
      delayMinutes: 0,
      platform: '1',
      status: 'ON_TIME',
      provider: 'SIMULATED',
      isLive: false
    },
    {
      trainNumber: '20608',
      trainName: 'Vande Bharat Express',
      sourceStation: 'MGR Chennai Central (MAS)',
      destinationStation: 'Mysuru Junction (MYS)',
      scheduledArrival: '12:20',
      estimatedArrival: '12:35',
      delayMinutes: 15,
      platform: '2',
      status: 'DELAYED',
      provider: 'SIMULATED',
      isLive: false
    },
    {
      trainNumber: '16231',
      trainName: 'Mayiladuturai - Mysuru Express',
      sourceStation: 'Mayiladuturai Junction (MV)',
      destinationStation: 'Mysuru Junction (MYS)',
      scheduledArrival: '08:40',
      estimatedArrival: '08:40',
      delayMinutes: 0,
      platform: '3',
      status: 'ON_TIME',
      provider: 'SIMULATED',
      isLive: false
    },
    {
      trainNumber: '12614',
      trainName: 'Wodeyar Superfast Express',
      sourceStation: 'KSR Bengaluru City (SBC)',
      destinationStation: 'Mysuru Junction (MYS)',
      scheduledArrival: '17:30',
      estimatedArrival: '17:42',
      delayMinutes: 12,
      platform: '1',
      status: 'DELAYED',
      provider: 'SIMULATED',
      isLive: false
    },
    {
      trainNumber: '16535',
      trainName: 'Gol Gumbaz Express',
      sourceStation: 'Solapur Junction (SUR)',
      destinationStation: 'Mysuru Junction (MYS)',
      scheduledArrival: '10:45',
      estimatedArrival: '10:45',
      delayMinutes: 0,
      platform: '2',
      status: 'ON_TIME',
      provider: 'SIMULATED',
      isLive: false
    },
    {
      trainNumber: '16216',
      trainName: 'Chamundi Express',
      sourceStation: 'KSR Bengaluru City (SBC)',
      destinationStation: 'Mysuru Junction (MYS)',
      scheduledArrival: '21:05',
      estimatedArrival: '21:05',
      delayMinutes: 0,
      platform: '4',
      status: 'ON_TIME',
      provider: 'SIMULATED',
      isLive: false
    }
  ];

  for (const t of trainsData) {
    await prisma.train.upsert({
      where: { trainNumber: t.trainNumber },
      update: t,
      create: t
    });
  }
  console.log('✅ Mysuru trains seeded');

  // 6. Seed Mysuru Destinations
  const destinationsData = [
    {
      name: 'Kuvempunagar',
      slug: 'kuvempunagar',
      address: 'Kuvempunagar Complex, Udayaravi Road, Mysuru, Karnataka 570023',
      latitude: 12.2855,
      longitude: 76.6265,
      category: 'Residential & Commercial Hub',
      baseFare: 35.0,
      estimatedTravelMinutes: 20
    },
    {
      name: 'Hebbal Industrial Area',
      slug: 'hebbal-industrial-area',
      address: 'Hebbal Electronic City & KIADB Industrial Area, Mysuru 570016',
      latitude: 12.3650,
      longitude: 76.6050,
      category: 'IT & Industrial Corridor',
      baseFare: 40.0,
      estimatedTravelMinutes: 30
    },
    {
      name: 'Manasagangothri',
      slug: 'manasagangothri',
      address: 'University of Mysore Campus, Bogadi Road, Mysuru 570006',
      latitude: 12.3150,
      longitude: 76.6230,
      category: 'Educational & University Zone',
      baseFare: 30.0,
      estimatedTravelMinutes: 15
    },
    {
      name: 'Vijayanagar 3rd Stage',
      slug: 'vijayanagar-3rd-stage',
      address: 'High Tension Double Road, Vijayanagar, Mysuru 570017',
      latitude: 12.3380,
      longitude: 76.6110,
      category: 'Residential Township',
      baseFare: 35.0,
      estimatedTravelMinutes: 25
    },
    {
      name: 'Suburban Bus Stand',
      slug: 'suburban-bus-stand',
      address: 'B.N. Road, Lashkar Mohalla, Mysuru 570001',
      latitude: 12.3106,
      longitude: 76.6575,
      category: 'Inter-City Transit Terminal',
      baseFare: 25.0,
      estimatedTravelMinutes: 12
    },
    {
      name: 'Infosys Mysore Campus',
      slug: 'infosys-campus',
      address: 'No. 350, Hebbal Electronics City, Hootagalli, Mysuru 570027',
      latitude: 12.3780,
      longitude: 76.5920,
      category: 'Tech Tech Campus',
      baseFare: 45.0,
      estimatedTravelMinutes: 35
    },
    {
      name: 'Chamundi Hill Foothills',
      slug: 'chamundi-hill',
      address: 'Tavarekatte / Sri Chamundeshwari Temple Base, Mysuru 570010',
      latitude: 12.2740,
      longitude: 76.6710,
      category: 'Heritage & Pilgrimage',
      baseFare: 35.0,
      estimatedTravelMinutes: 22
    },
    {
      name: 'JP Nagar Mysuru',
      slug: 'jp-nagar',
      address: 'Outer Ring Road, JP Nagar 1st Phase, Mysuru 570008',
      latitude: 12.2680,
      longitude: 76.6480,
      category: 'Southern Suburban Zone',
      baseFare: 35.0,
      estimatedTravelMinutes: 25
    }
  ];

  const createdDestinations = {};
  for (const d of destinationsData) {
    const dest = await prisma.destination.upsert({
      where: { slug: d.slug },
      update: d,
      create: d
    });
    createdDestinations[d.slug] = dest;
  }
  console.log('✅ Destinations seeded');

  // 7. Seed Routes & Stops
  const routesData = [
    {
      routeNumber: 'RB-01',
      routeName: 'Mysuru Jn → Kuvempunagar Direct Connect',
      destinationSlug: 'kuvempunagar',
      totalDistanceKm: 7.2,
      estimatedDurationMinutes: 20,
      stops: [
        { stopName: 'Mysuru Junction Station', stopOrder: 1, latitude: 12.3164, longitude: 76.6433, estimatedArrivalOffsetMinutes: 0 },
        { stopName: 'Ramaswamy Circle', stopOrder: 2, latitude: 12.3021, longitude: 76.6412, estimatedArrivalOffsetMinutes: 7 },
        { stopName: 'Ballal Circle (Ashoka Circle)', stopOrder: 3, latitude: 12.2965, longitude: 76.6384, estimatedArrivalOffsetMinutes: 12 },
        { stopName: 'Akshaya Bhandar', stopOrder: 4, latitude: 12.2902, longitude: 76.6315, estimatedArrivalOffsetMinutes: 16 },
        { stopName: 'Kuvempunagar Complex', stopOrder: 5, latitude: 12.2855, longitude: 76.6265, estimatedArrivalOffsetMinutes: 20 }
      ]
    },
    {
      routeNumber: 'RB-02',
      routeName: 'Mysuru Jn → Hebbal KIADB IT Express',
      destinationSlug: 'hebbal-industrial-area',
      totalDistanceKm: 11.5,
      estimatedDurationMinutes: 30,
      stops: [
        { stopName: 'Mysuru Junction Station', stopOrder: 1, latitude: 12.3164, longitude: 76.6433, estimatedArrivalOffsetMinutes: 0 },
        { stopName: 'Yadavagiri Railway Colony', stopOrder: 2, latitude: 12.3275, longitude: 76.6310, estimatedArrivalOffsetMinutes: 8 },
        { stopName: 'Vani Vilas Water Works', stopOrder: 3, latitude: 12.3390, longitude: 76.6220, estimatedArrivalOffsetMinutes: 15 },
        { stopName: 'Kumbarakoppal', stopOrder: 4, latitude: 12.3510, longitude: 76.6130, estimatedArrivalOffsetMinutes: 22 },
        { stopName: 'Hebbal Industrial KIADB', stopOrder: 5, latitude: 12.3650, longitude: 76.6050, estimatedArrivalOffsetMinutes: 30 }
      ]
    },
    {
      routeNumber: 'RB-03',
      routeName: 'Mysuru Jn → Manasagangothri Campus Shuttle',
      destinationSlug: 'manasagangothri',
      totalDistanceKm: 4.8,
      estimatedDurationMinutes: 15,
      stops: [
        { stopName: 'Mysuru Junction Station', stopOrder: 1, latitude: 12.3164, longitude: 76.6433, estimatedArrivalOffsetMinutes: 0 },
        { stopName: 'Field Marshal Cariappa Circle', stopOrder: 2, latitude: 12.3130, longitude: 76.6360, estimatedArrivalOffsetMinutes: 5 },
        { stopName: 'Kukkarahalli Lake Gate', stopOrder: 3, latitude: 12.3110, longitude: 76.6280, estimatedArrivalOffsetMinutes: 10 },
        { stopName: 'Manasagangothri Main Clock Tower', stopOrder: 4, latitude: 12.3150, longitude: 76.6230, estimatedArrivalOffsetMinutes: 15 }
      ]
    },
    {
      routeNumber: 'RB-04',
      routeName: 'Mysuru Jn → Vijayanagar Rapid Transit',
      destinationSlug: 'vijayanagar-3rd-stage',
      totalDistanceKm: 8.4,
      estimatedDurationMinutes: 25,
      stops: [
        { stopName: 'Mysuru Junction Station', stopOrder: 1, latitude: 12.3164, longitude: 76.6433, estimatedArrivalOffsetMinutes: 0 },
        { stopName: 'CFTRI Layout', stopOrder: 2, latitude: 12.3240, longitude: 76.6340, estimatedArrivalOffsetMinutes: 6 },
        { stopName: 'Gokulam 3rd Stage', stopOrder: 3, latitude: 12.3320, longitude: 76.6250, estimatedArrivalOffsetMinutes: 14 },
        { stopName: 'Vijayanagar Water Tank', stopOrder: 4, latitude: 12.3380, longitude: 76.6110, estimatedArrivalOffsetMinutes: 25 }
      ]
    },
    {
      routeNumber: 'RB-05',
      routeName: 'Mysuru Jn → Suburban Bus Terminal Link',
      destinationSlug: 'suburban-bus-stand',
      totalDistanceKm: 2.8,
      estimatedDurationMinutes: 12,
      stops: [
        { stopName: 'Mysuru Junction Station', stopOrder: 1, latitude: 12.3164, longitude: 76.6433, estimatedArrivalOffsetMinutes: 0 },
        { stopName: 'K.R. Hospital Circle', stopOrder: 2, latitude: 12.3140, longitude: 76.6500, estimatedArrivalOffsetMinutes: 4 },
        { stopName: 'Mysore Palace North Gate', stopOrder: 3, latitude: 12.3080, longitude: 76.6540, estimatedArrivalOffsetMinutes: 8 },
        { stopName: 'Suburban Bus Stand Platform 1', stopOrder: 4, latitude: 12.3106, longitude: 76.6575, estimatedArrivalOffsetMinutes: 12 }
      ]
    }
  ];

  for (const r of routesData) {
    const dest = createdDestinations[r.destinationSlug];
    if (dest) {
      const route = await prisma.route.upsert({
        where: { routeNumber: r.routeNumber },
        update: {
          routeName: r.routeName,
          destinationId: dest.id,
          totalDistanceKm: r.totalDistanceKm,
          estimatedDurationMinutes: r.estimatedDurationMinutes,
          isActive: true
        },
        create: {
          routeNumber: r.routeNumber,
          routeName: r.routeName,
          destinationId: dest.id,
          totalDistanceKm: r.totalDistanceKm,
          estimatedDurationMinutes: r.estimatedDurationMinutes,
          isActive: true
        }
      });

      // Clear existing stops and re-create
      await prisma.routeStop.deleteMany({ where: { routeId: route.id } });
      for (const st of r.stops) {
        await prisma.routeStop.create({
          data: {
            routeId: route.id,
            stopName: st.stopName,
            stopOrder: st.stopOrder,
            latitude: st.latitude,
            longitude: st.longitude,
            estimatedArrivalOffsetMinutes: st.estimatedArrivalOffsetMinutes
          }
        });
      }
    }
  }
  console.log('✅ Routes and stops seeded');

  // 8. Seed KSRTC Fleet Vehicles
  const vehiclesData = [
    { busNumber: 'KSRTC-MYS-4412', registrationNumber: 'KA-09-F-4412', vehicleType: 'KSRTC Sarige / City Express', capacity: 56, status: 'AVAILABLE', depot: 'Mysuru Central Depot 1' },
    { busNumber: 'KSRTC-MYS-5589', registrationNumber: 'KA-09-F-5589', vehicleType: 'KSRTC Sarige / City Express', capacity: 56, status: 'AVAILABLE', depot: 'Mysuru Central Depot 1' },
    { busNumber: 'KSRTC-MYS-7123', registrationNumber: 'KA-09-F-7123', vehicleType: 'KSRTC Low-Floor City Bus', capacity: 56, status: 'AVAILABLE', depot: 'Kuvempunagar Depot 2' },
    { busNumber: 'KSRTC-MYS-8890', registrationNumber: 'KA-09-F-8890', vehicleType: 'KSRTC Sarige / City Express', capacity: 56, status: 'AVAILABLE', depot: 'Bannimantap Depot 3' },
    { busNumber: 'KSRTC-MYS-9901', registrationNumber: 'KA-09-F-9901', vehicleType: 'KSRTC Electric City Cruiser', capacity: 56, status: 'MAINTENANCE', depot: 'Mysuru Central Depot 1' }
  ];

  for (const v of vehiclesData) {
    await prisma.vehicle.upsert({
      where: { busNumber: v.busNumber },
      update: v,
      create: v
    });
  }
  console.log('✅ Fleet vehicles seeded');

  // 9. Seed Drivers
  const driversData = [
    { name: 'Ramesh Kumar H.', licenseNumber: 'KA-09-20150004912', phone: '+919448100111', status: 'AVAILABLE' },
    { name: 'Basavaraju M.', licenseNumber: 'KA-09-20180007812', phone: '+919448100222', status: 'AVAILABLE' },
    { name: 'Manjunatha K.', licenseNumber: 'KA-09-20120003190', phone: '+919448100333', status: 'AVAILABLE' },
    { name: 'Shivakumar N.', licenseNumber: 'KA-09-20160005431', phone: '+919448100444', status: 'AVAILABLE' }
  ];

  for (const dr of driversData) {
    await prisma.driver.upsert({
      where: { licenseNumber: dr.licenseNumber },
      update: dr,
      create: dr
    });
  }
  console.log('✅ Drivers seeded');

  // 10. Seed Sample Active Passenger Pools to Demonstrate the Operations Centre
  const shatabdiTrain = await prisma.train.findUnique({ where: { trainNumber: '12008' } });
  const kuvempunagarDest = createdDestinations['kuvempunagar'];
  const hebbalDest = createdDestinations['hebbal-industrial-area'];
  const todayStr = new Date().toISOString().split('T')[0];

  if (shatabdiTrain && kuvempunagarDest) {
    // Pool 1: ELIGIBLE_FOR_REVIEW (reached 24 passengers, awaiting admin review)
    const pool1 = await prisma.passengerPool.upsert({
      where: { poolCode: 'POOL-MYS-12008-KUV-01' },
      update: {
        currentPassengerCount: 24,
        status: 'ELIGIBLE_FOR_REVIEW'
      },
      create: {
        poolCode: 'POOL-MYS-12008-KUV-01',
        destinationId: kuvempunagarDest.id,
        trainId: shatabdiTrain.id,
        journeyDate: todayStr,
        status: 'ELIGIBLE_FOR_REVIEW',
        minCapacity: 20,
        maxCapacity: 56,
        currentPassengerCount: 24,
        targetBoardingWindow: '13:10 - 13:25'
      }
    });

    // Pool 2: FORMING (8 passengers)
    if (hebbalDest) {
      await prisma.passengerPool.upsert({
        where: { poolCode: 'POOL-MYS-12008-HEB-01' },
        update: {
          currentPassengerCount: 8,
          status: 'FORMING'
        },
        create: {
          poolCode: 'POOL-MYS-12008-HEB-01',
          destinationId: hebbalDest.id,
          trainId: shatabdiTrain.id,
          journeyDate: todayStr,
          status: 'FORMING',
          minCapacity: 20,
          maxCapacity: 56,
          currentPassengerCount: 8,
          targetBoardingWindow: '13:15 - 13:30'
        }
      });
    }

    // Seed a sample booking and confirmed ticket for Ananya Rao
    const sampleBooking = await prisma.booking.upsert({
      where: { bookingCode: 'RB-BK-202610-001' },
      update: {
        paymentStatus: 'PAID',
        bookingStatus: 'POOL_CONFIRMED',
        poolId: pool1.id
      },
      create: {
        bookingCode: 'RB-BK-202610-001',
        passengerId: passenger.id,
        trainId: shatabdiTrain.id,
        destinationId: kuvempunagarDest.id,
        journeyDate: todayStr,
        passengerCount: 1,
        totalFare: 35.0,
        paymentStatus: 'PAID',
        bookingStatus: 'POOL_CONFIRMED',
        poolId: pool1.id
      }
    });

    // Create pool membership
    await prisma.poolMember.upsert({
      where: { bookingId: sampleBooking.id },
      update: {},
      create: {
        poolId: pool1.id,
        bookingId: sampleBooking.id,
        passengerId: passenger.id,
        passengerCount: 1
      }
    });

    // Create payment
    await prisma.payment.upsert({
      where: { paymentCode: 'PAY-RB-202610-001' },
      update: { status: 'CAPTURED' },
      create: {
        paymentCode: 'PAY-RB-202610-001',
        bookingId: sampleBooking.id,
        passengerId: passenger.id,
        amount: 35.0,
        currency: 'INR',
        gateway: 'TEST_MOCK',
        razorpayPaymentId: 'pay_test_mysuru_1001',
        status: 'CAPTURED'
      }
    });

    // Create confirmed ticket with 6-digit code and QR token
    const ticketCode = 'TKT-MYS-2026-8801';
    const sixDigitCode = '749215';
    const qrToken = 'QR_RAILBUS_MYS_8801_SECURE';

    await prisma.ticket.upsert({
      where: { ticketCode: ticketCode },
      update: {},
      create: {
        ticketCode: ticketCode,
        sixDigitCode: sixDigitCode,
        bookingId: sampleBooking.id,
        passengerId: passenger.id,
        qrToken: qrToken,
        status: 'ISSUED',
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    console.log('✅ Sample active pool, booking, payment, and ticket seeded');
  }

  console.log('🎉 RAILBUS database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
