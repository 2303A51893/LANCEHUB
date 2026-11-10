
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'lancehub_super_secret_jwt_key_2026';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact administrator.'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid user ID in token.'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  JWT_SECRET
};
