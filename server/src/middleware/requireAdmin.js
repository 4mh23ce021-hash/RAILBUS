function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required prior to role verification.'
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      code: 'ACCESS_DENIED',
      message: 'Forbidden. Admin privileges required to access this resource.'
    });
  }

  next();
}

module.exports = requireAdmin;
