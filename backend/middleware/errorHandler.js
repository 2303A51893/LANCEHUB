
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(
      error => error.message
    );

    return res.status(400).json({
      success: false,
      message: messages.join(', '),
      errors: messages
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';

    return res.status(409).json({
      success: false,
      message: `${field} already exists.`,
      errors: [`Duplicate value for ${field}.`]
    });
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID or data format.'
    });
  }

  // JWT errors
  if (
    err.name === 'JsonWebTokenError' ||
    err.name === 'TokenExpiredError'
  ) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.'
    });
  }

  // MongoDB connection errors
  if (
    err.name === 'MongoServerError' ||
    err.name === 'MongoNetworkError'
  ) {
    return res.status(503).json({
      success: false,
      message: 'Database operation failed. Please try again later.'
    });
  }

  const statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack:
      process.env.NODE_ENV === 'production'
        ? null
        : err.stack
  });
};

module.exports = errorHandler;
