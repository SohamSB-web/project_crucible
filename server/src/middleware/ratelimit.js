const { Ratelimit } = require('@upstash/ratelimit');
const { Redis } = require('@upstash/redis');

// Single shared Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Create an Express middleware that rate-limits by IP using Upstash Redis.
 *
 * @param {number} requests - max allowed requests
 * @param {'10 m'|'5 m'|'15 m'|'1 h'} window - sliding window duration
 * @param {string} prefix   - unique key prefix per endpoint class
 */
function createRateLimiter(requests, window, prefix) {
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `rl:${prefix}`,
    analytics: false,
  });

  return async (req, res, next) => {
    // Gracefully bypass if Redis is not configured (local dev without Upstash)
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return next();
    }

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';

    try {
      const { success, limit, remaining, reset } = await limiter.limit(ip);

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', reset);

      if (!success) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests. Please slow down and try again.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        });
      }
      next();
    } catch (err) {
      // Don't block the request if rate limiter itself fails
      console.error('[RateLimit] Redis error:', err.message);
      next();
    }
  };
}

// ─── Pre-built limiters per endpoint class ────────────────────────────────────

/** Public write: register / join-team — 5 req per 10 minutes per IP */
const publicWriteLimiter = createRateLimiter(5, '10 m', 'public-write');

/** Admin/judge login — 10 req per 15 minutes per IP */
const loginLimiter = createRateLimiter(10, '15 m', 'login');

/** File upload — 5 req per 5 minutes per IP */
const uploadLimiter = createRateLimiter(5, '5 m', 'upload');

/** General API — 60 req per minute per IP (baseline abuse protection) */
const generalLimiter = createRateLimiter(60, '1 m', 'general');

module.exports = { publicWriteLimiter, loginLimiter, uploadLimiter, generalLimiter };
