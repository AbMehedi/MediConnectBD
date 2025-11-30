const { validationResult } = require('express-validator');

/**
 * Middleware to validate request data
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  
  next();
};

/**
 * Detect if request is from mobile device
 */
const detectPlatform = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  
  req.platform = {
    isMobile: /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent),
    isIOS: /iPhone|iPad|iPod/i.test(userAgent),
    isAndroid: /Android/i.test(userAgent),
    isWeb: !/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)
  };
  
  next();
};

/**
 * Request logger middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms) - ${req.platform?.isMobile ? 'Mobile' : 'Web'}`);
  });
  
  next();
};

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  validate,
  detectPlatform,
  requestLogger,
  errorHandler
};
