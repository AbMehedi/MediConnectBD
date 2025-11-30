const rateLimit = require('express-rate-limit');
const config = require('../config/config');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    error: 'Too many login attempts, please try again after 15 minutes'
  },
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter for AI endpoints (more restrictive)
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 AI requests per 15 minutes
  message: {
    success: false,
    error: 'AI request limit exceeded, please try again later'
  },
});

/**
 * Mobile-friendly rate limiter (less restrictive)
 */
const mobileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: 'Mobile request limit exceeded'
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiLimiter,
  mobileLimiter
};
