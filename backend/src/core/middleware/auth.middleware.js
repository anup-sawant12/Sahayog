const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header is missing',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Format must be: Bearer <token>',
    });
  }

  const token = parts[1];
  const jwtSecret = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, jwtSecret);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token',
    });
  }
};

module.exports = {
  authenticate,
};
