/**
 * Calculates optimal boarding and bus departure recommendations
 * based on train estimated arrival, delay updates, and platform walking times.
 */
function calculateBoardingWindow(trainEstimatedArrival, trainDelayMinutes = 0) {
  if (!trainEstimatedArrival) {
    return {
      windowString: '15 - 25 min after arrival',
      recommendedBoardingTime: null,
      departureTime: null
    };
  }

  const [h, m] = trainEstimatedArrival.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) {
    return {
      windowString: '15 - 25 min after arrival',
      recommendedBoardingTime: null,
      departureTime: null
    };
  }

  // Mysuru Junction average deboarding & platform exit transit: 8 minutes
  const totalMinutes = h * 60 + m;
  const boardingStart = totalMinutes + 10;
  const departureTime = totalMinutes + 25;

  const formatTime = (totalMin) => {
    const hh = Math.floor((totalMin % 1440) / 60);
    const mm = totalMin % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  return {
    windowString: `${formatTime(boardingStart)} - ${formatTime(departureTime)}`,
    boardingStartTime: formatTime(boardingStart),
    recommendedDepartureTime: formatTime(departureTime),
    bufferMinutes: 15,
    walkingTimeMinutes: 8
  };
}

module.exports = {
  calculateBoardingWindow
};
