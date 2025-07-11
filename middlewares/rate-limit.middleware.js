import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints
 * Restricts to 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      statusCode: 429,
      status: 'error',
      message: 'Too many authentication attempts, please try again later'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests
  skipSuccessfulRequests: true,
});

/**
 * General API rate limiter
 * Restricts to 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      statusCode: 429,
      status: 'error',
      message: 'Too many requests from this IP, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for sensitive operations
 * Restricts to 3 attempts per hour per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per hour
  message: {
    success: false,
    error: {
      statusCode: 429,
      status: 'error',
      message: 'Too many attempts, please try again in an hour'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default { authLimiter, apiLimiter, strictLimiter };
