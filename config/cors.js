/**
 * CORS configuration utility
 * Provides environment-based allowed origins for CORS
 */

/**
 * Get allowed origins based on environment
 * @returns {string[]} Array of allowed origin URLs
 */
export const getAllowedOrigins = () => {
  const origins = [];
  
  // Always include the main frontend URL if set
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  // Development origins
  if (process.env.NODE_ENV === 'development') {
    origins.push(
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    );
  }
  
  // Add any additional origins from environment variable
  if (process.env.ADDITIONAL_ORIGINS) {
    const additionalOrigins = process.env.ADDITIONAL_ORIGINS.split(',').map(origin => origin.trim());
    origins.push(...additionalOrigins);
  }
  
  // Remove duplicates and filter out empty strings
  return [...new Set(origins)].filter(Boolean);
};

/**
 * CORS options configuration
 */
export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origin ${origin} not allowed`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

/**
 * Socket.IO CORS options
 */
export const socketCorsOptions = {
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST'],
  credentials: true,
};

export default { getAllowedOrigins, corsOptions, socketCorsOptions };
