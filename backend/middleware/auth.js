const { requireAuth } = require('@clerk/express');

// Middleware to check if user is admin (via Clerk public metadata)
const requireAdmin = (req, res, next) => {
  const role = req.auth?.sessionClaims?.metadata?.role;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
