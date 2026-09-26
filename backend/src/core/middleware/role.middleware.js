const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userRole = req.user.role;
    const hasRole =
      allowedRoles.includes(userRole) ||
      (allowedRoles.includes('ADMIN') &&
        (userRole === 'ADMIN' ||
          userRole === 'SUPER_ADMIN' ||
          userRole === 'COOPERATIVE_ADMIN' ||
          userRole === 'FEDERATION_ADMIN'));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    next();
  };
};

module.exports = {
  authorize,
};
