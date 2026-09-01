

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Middleware: verify a Cloudflare Turnstile token sent in the request body
 * as `cf_turnstile_response`.
 *
 * Skip verification if SKIP_TURNSTILE=true (for local development).
 */
async function verifyTurnstile(req, res, next) {
  // Allow bypassing in local dev
  if (process.env.SKIP_TURNSTILE === 'true') {
    return next();
  }

  const token = req.body?.cf_turnstile_response;
  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'CAPTCHA verification is required.',
    });
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    undefined;

  try {
    const formData = new URLSearchParams();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    if (ip) formData.append('remoteip', ip);

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'CAPTCHA verification failed. Please try again.',
      });
    }

    next();
  } catch (err) {
    console.error('[Turnstile] Verification error:', err.message);
    // Fail open if Cloudflare is unreachable — don't block legitimate users
    next();
  }
}

module.exports = { verifyTurnstile };
