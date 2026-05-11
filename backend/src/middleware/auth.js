import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const token = req.cookies?.auth;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = verifyToken(token);
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}
