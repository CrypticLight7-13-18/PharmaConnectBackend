import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';

/**
 * Sanitize input data against NoSQL injection and XSS attacks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const sanitizeInput = (req, res, next) => {
  // Sanitize against NoSQL injection
  req.body = mongoSanitize.sanitize(req.body);
  req.query = mongoSanitize.sanitize(req.query);
  req.params = mongoSanitize.sanitize(req.params);
  
  // Sanitize against XSS attacks
  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = xss(obj[key], {
            whiteList: {}, // No HTML tags allowed
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script']
          });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    }
  };
  
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  
  next();
};

/**
 * Express middleware to apply mongo sanitization only
 */
export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Potential NoSQL injection attempt detected: ${key} in ${req.path}`);
  }
});

export default { sanitizeInput, mongoSanitizeMiddleware };
