const rateLimit = require('express-rate-limit');

// Strict limiter for sensitive auth endpoints (login, register, change/verify
// password). `skipSuccessfulRequests` means only failed attempts count toward the
// limit, so legitimate users are not penalized while brute-force attempts are.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

// Limiter for the unauthenticated-surface SMS webhook. Generous enough for normal
// SMS volume, but caps flooding from a single source.
const webhookLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests.' },
});

module.exports = { authLimiter, webhookLimiter };
