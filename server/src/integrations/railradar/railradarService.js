const axios = require('axios');
const env = require('../../config/env');
const prisma = require('../../config/prisma');

// In-memory cache to prevent hitting rate limits
const trainStatusCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

/**
 * Fetch live train status from RailRadar API if credentials exist,
 * otherwise safely fallback to simulated real-time data.
 */
async function getTrainLiveStatus(trainNumber) {
  const cached = trainStatusCache.get(trainNumber);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  // Check if live API key is configured
  if (env.RAILRADAR_API_KEY && env.RAILRADAR_API_KEY.trim().length > 0 && env.RAILRADAR_MODE === 'live') {
    try {
      const response = await axios.get(`${env.RAILRADAR_BASE_URL}/trains/${trainNumber}/live-status`, {
        headers: {
          'Authorization': `Bearer ${env.RAILRADAR_API_KEY}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      });

      if (response.data && response.data.success) {
        const liveData = {
          trainNumber,
          trainName: response.data.train_name,
          currentStation: response.data.current_station_name,
          delayMinutes: response.data.delay_in_minutes || 0,
          scheduledArrival: response.data.scheduled_arrival_time,
          estimatedArrival: response.data.estimated_arrival_time,
          status: response.data.status || 'ON_TIME',
          platform: response.data.platform_number || '1',
          isLive: true,
          provider: 'RAILRADAR',
          label: 'OFFICIAL RAILRADAR LIVE',
          lastUpdated: new Date().toISOString()
        };

        trainStatusCache.set(trainNumber, { timestamp: Date.now(), data: liveData });
        return liveData;
      }
    } catch (err) {
      console.warn(`[RailRadar] Live request failed for train ${trainNumber}: ${err.message}. Falling back to simulated.`);
    }
  }

  // Fallback to database record or simulated tracking
  const dbTrain = await prisma.train.findUnique({
    where: { trainNumber }
  });

  if (!dbTrain) {
    return {
      trainNumber,
      trainName: 'Express Train',
      delayMinutes: 0,
      scheduledArrival: '12:00',
      estimatedArrival: '12:00',
      status: 'ON_TIME',
      platform: '1',
      isLive: false,
      provider: 'SIMULATED',
      label: 'DEMO TRAIN DATA — SIMULATED',
      lastUpdated: new Date().toISOString()
    };
  }

  const simulatedData = {
    trainNumber: dbTrain.trainNumber,
    trainName: dbTrain.trainName,
    sourceStation: dbTrain.sourceStation,
    destinationStation: dbTrain.destinationStation,
    scheduledArrival: dbTrain.scheduledArrival,
    estimatedArrival: dbTrain.estimatedArrival,
    delayMinutes: dbTrain.delayMinutes,
    platform: dbTrain.platform,
    status: dbTrain.status,
    isLive: false,
    provider: 'SIMULATED',
    label: 'DEMO TRAIN DATA — SIMULATED',
    lastUpdated: dbTrain.lastUpdated.toISOString()
  };

  trainStatusCache.set(trainNumber, { timestamp: Date.now(), data: simulatedData });
  return simulatedData;
}

/**
 * Updates train arrival and delay in database and returns updated train
 */
async function updateTrainStatus(trainNumber, { delayMinutes, status, platform, estimatedArrival }) {
  const train = await prisma.train.update({
    where: { trainNumber },
    data: {
      delayMinutes: delayMinutes !== undefined ? delayMinutes : undefined,
      status: status || undefined,
      platform: platform || undefined,
      estimatedArrival: estimatedArrival || undefined,
      lastUpdated: new Date()
    }
  });

  // Clear cache for this train
  trainStatusCache.delete(trainNumber);
  return train;
}

module.exports = {
  getTrainLiveStatus,
  updateTrainStatus
};
