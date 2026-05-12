const buckets = new Map();

export function createRateLimiter({ windowMs, max }) {
  return (req, res, next) => {
    const key = `${req.path}:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.expiresAt <= now) {
      buckets.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (bucket.count >= max) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    bucket.count += 1;
    return next();
  };
}
