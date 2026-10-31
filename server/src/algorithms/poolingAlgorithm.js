const prisma = require('../config/prisma');

const POOL_RULES = {
  MIN_PASSENGERS: 20,
  MAX_PASSENGERS: 56,
  STATUS: {
    FORMING: 'FORMING',
    ELIGIBLE_FOR_REVIEW: 'ELIGIBLE_FOR_REVIEW',
    FULL: 'FULL',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    DISPATCHED: 'DISPATCHED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  }
};

/**
 * Determines appropriate pool status from passenger count
 */
function determinePoolStatus(count, currentStatus) {
  if (['APPROVED', 'DISPATCHED', 'COMPLETED', 'REJECTED', 'CANCELLED'].includes(currentStatus)) {
    return currentStatus;
  }
  if (count >= POOL_RULES.MAX_PASSENGERS) {
    return POOL_RULES.STATUS.FULL;
  }
  if (count >= POOL_RULES.MIN_PASSENGERS) {
    return POOL_RULES.STATUS.ELIGIBLE_FOR_REVIEW;
  }
  return POOL_RULES.STATUS.FORMING;
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Finds or creates a compatible passenger pool and adds the booking atomically.
 * Ensures strict capacity enforcement: max 56 passengers per vehicle/pool.
 * Multi-Train Rule: If 2 or more trains arrive at Mysuru Junction within a 10-minute window
 * (gap <= 10 min), passengers heading to the same destination can be pooled together into ONE shared feeder bus.
 * If the arrival gap exceeds 10 minutes (> 10 min), independent dedicated feeder buses are allocated.
 */
async function assignPassengerToPool(tx, { destinationId, trainId, journeyDate, bookingId, passengerId, passengerCount = 1 }) {
  if (passengerCount > POOL_RULES.MAX_PASSENGERS) {
    throw new Error(`Passenger count ${passengerCount} exceeds maximum vehicle capacity of ${POOL_RULES.MAX_PASSENGERS}`);
  }

  const currentTrain = await tx.train.findUnique({ where: { id: trainId } });
  const currentTrainMins = currentTrain ? parseTimeToMinutes(currentTrain.estimatedArrival) : 0;

  // 1. Search for existing compatible pool for the same train
  const exactCompatiblePools = await tx.passengerPool.findMany({
    where: {
      destinationId,
      trainId,
      journeyDate,
      status: {
        in: [POOL_RULES.STATUS.FORMING, POOL_RULES.STATUS.ELIGIBLE_FOR_REVIEW]
      }
    },
    orderBy: {
      createdAt: 'asc' // FIFO pool filling strategy
    }
  });

  let selectedPool = null;
  for (const pool of exactCompatiblePools) {
    if (pool.currentPassengerCount + passengerCount <= POOL_RULES.MAX_PASSENGERS) {
      selectedPool = pool;
      break;
    }
  }

  // 1b. If no exact pool found, search for multi-train synchronized pool (arrival gap <= 10 mins)
  if (!selectedPool && currentTrain) {
    const candidatePools = await tx.passengerPool.findMany({
      where: {
        destinationId,
        journeyDate,
        status: {
          in: [POOL_RULES.STATUS.FORMING, POOL_RULES.STATUS.ELIGIBLE_FOR_REVIEW]
        }
      },
      include: {
        train: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    for (const pool of candidatePools) {
      if (pool.train) {
        const poolTrainMins = parseTimeToMinutes(pool.train.estimatedArrival);
        const arrivalGap = Math.abs(currentTrainMins - poolTrainMins);
        // Multi-train rule: maximum 10-minute gap between train arrivals
        if (arrivalGap <= 10 && (pool.currentPassengerCount + passengerCount <= POOL_RULES.MAX_PASSENGERS)) {
          selectedPool = pool;
          break;
        }
      }
    }
  }

  // 2. If no compatible pool has capacity or arrival gap > 10 min, instantiate a new dedicated pool
  if (!selectedPool) {
    const train = currentTrain || await tx.train.findUnique({ where: { id: trainId } });
    const dest = await tx.destination.findUnique({ where: { id: destinationId } });

    const timestamp = Date.now().toString().slice(-6);
    const trainNum = train ? train.trainNumber : 'TR';
    const destSlug = dest ? dest.slug.slice(0, 3).toUpperCase() : 'DST';
    const poolCode = `POOL-MYS-${trainNum}-${destSlug}-${timestamp}`;

    // Target boarding window: 10-25 mins after train estimated arrival
    let targetBoardingWindow = 'Arrival + 15 min';
    if (train && train.estimatedArrival) {
      const [h, m] = train.estimatedArrival.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const startMin = (m + 10) % 60;
        const startH = (h + Math.floor((m + 10) / 60)) % 24;
        const endMin = (m + 25) % 60;
        const endH = (h + Math.floor((m + 25) / 60)) % 24;
        const pad = (n) => String(n).padStart(2, '0');
        targetBoardingWindow = `${pad(startH)}:${pad(startMin)} - ${pad(endH)}:${pad(endMin)}`;
      }
    }

    selectedPool = await tx.passengerPool.create({
      data: {
        poolCode,
        destinationId,
        trainId,
        journeyDate,
        status: POOL_RULES.STATUS.FORMING,
        minCapacity: POOL_RULES.MIN_PASSENGERS,
        maxCapacity: POOL_RULES.MAX_PASSENGERS,
        currentPassengerCount: 0,
        targetBoardingWindow
      }
    });
  }

  // 3. Atomically attach pool member & update pool count
  const newCount = selectedPool.currentPassengerCount + passengerCount;
  const newStatus = determinePoolStatus(newCount, selectedPool.status);

  const updatedPool = await tx.passengerPool.update({
    where: { id: selectedPool.id },
    data: {
      currentPassengerCount: newCount,
      status: newStatus
    },
    include: {
      destination: true,
      train: true
    }
  });

  // Create PoolMember record linking booking
  const poolMember = await tx.poolMember.create({
    data: {
      poolId: selectedPool.id,
      bookingId,
      passengerId,
      passengerCount
    }
  });

  // Update Booking with assigned poolId
  await tx.booking.update({
    where: { id: bookingId },
    data: {
      poolId: selectedPool.id,
      bookingStatus: 'POOL_CONFIRMED'
    }
  });

  return {
    pool: updatedPool,
    member: poolMember,
    reachedReviewThreshold: updatedPool.status === POOL_RULES.STATUS.ELIGIBLE_FOR_REVIEW && selectedPool.status === POOL_RULES.STATUS.FORMING,
    isFull: updatedPool.status === POOL_RULES.STATUS.FULL
  };
}

module.exports = {
  POOL_RULES,
  determinePoolStatus,
  assignPassengerToPool
};
