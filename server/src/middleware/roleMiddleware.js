module.exports = function roleMiddleware(...allowedRoles) {
  return function requireRole(req, res, next) {
    if (req.user?.role === 'admin' || allowedRoles.includes(req.user?.role)) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden' });
  };
};
