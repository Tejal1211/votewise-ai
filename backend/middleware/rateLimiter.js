const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter
 * Applies to all /api routes
 * Limit: 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: (req) => process.env.NODE_ENV === "test",
});

/**
 * Chat-specific rate limiter
 * More restrictive for AI chat requests
 * Limit: 20 requests per minute
 */
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { error: "Too many chat requests, slow down." },
  skip: (req) => process.env.NODE_ENV === "test",
});

/**
 * Admin endpoint rate limiter
 * Much more restrictive for sensitive admin operations
 * Limit: 10 requests per 5 minutes
 */
const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { error: "Too many admin requests. Please wait before trying again." },
  skip: (req) => process.env.NODE_ENV === "test",
});

module.exports = { apiLimiter, chatLimiter, adminLimiter };
