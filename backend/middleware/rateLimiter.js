// Sliding-window rate limiter. Currently in-memory (per-instance), but the
// shape matches a Redis INCR/EXPIRE backend so swapping later is a one-line
// change inside `bump()`. Fail-open if the backend errors — we'd rather serve
// the request than lock real users out due to infra trouble.

const buckets = new Map();

// Periodic GC so dead IPs don't accumulate forever. Hourly is fine: each
// bucket only holds a small array of timestamps.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}, 60 * 60 * 1000).unref();

const bump = (key, windowMs, max) => {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { count: 1, remaining: max - 1, retryAfter: 0 };
  }

  entry.count += 1;
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
  return { count: entry.count, remaining: Math.max(0, max - entry.count), retryAfter };
};

const rateLimit = ({ windowSec, max, keyFn, message }) => (req, res, next) => {
  try {
    const key = keyFn(req);
    if (!key) return next();

    const result = bump(key, windowSec * 1000, max);

    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(result.remaining));

    if (result.count > max) {
      res.set('Retry-After', String(result.retryAfter));
      return res.status(429).json({
        message: message || 'Too many requests. Please try again later.',
        retryAfter: result.retryAfter,
      });
    }
    next();
  } catch {
    // Backend failure — never block legitimate traffic. The downstream
    // handler still has its own validation and DB constraints.
    next();
  }
};

const ipKey = (prefix) => (req) => {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    'unknown';
  return `${prefix}:${ip}`;
};

module.exports = { rateLimit, ipKey };
