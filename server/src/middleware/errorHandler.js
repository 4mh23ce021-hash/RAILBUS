function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for request parameters.',
      errors: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Unique constraint conflict. A record with this identifier already exists.',
      target: err.meta?.target
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
}

module.exports = errorHandler;
