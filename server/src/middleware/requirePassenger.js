function requirePassenger(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required prior to role verification.'
    });
  }

  // PASSENGER role required (or ADMIN acting in passenger test mode if permitted)
  if (req.user.role !== 'PASSENGER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      code: 'ACCESS_DENIED',
      message: 'Forbidden. Passenger access only.'
    });
  }

  next();
}

module.exports = requirePassenger;
