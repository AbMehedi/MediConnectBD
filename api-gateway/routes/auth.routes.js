const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken, generateToken, generateRefreshToken } = require('../middleware/auth');
const { validate } = require('../middleware/common');
const { authLimiter } = require('../middleware/rateLimiter');
const { proxyToBackend } = require('../utils/proxy');

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
    body('gender').optional().isIn(['MALE', 'FEMALE']).withMessage('Gender must be MALE or FEMALE'),
    body('role').optional().isIn(['PATIENT', 'DOCTOR', 'ADMIN']).withMessage('Invalid role')
  ],
  validate,
  async (req, res) => {
    await proxyToBackend(req, res, '/api/auth/register');
  }
);

/**
 * User Login (Simple)
 * POST /api/auth/login
 */
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  validate,
  async (req, res) => {
    await proxyToBackend(req, res, '/api/auth/login');
  }
);

/**
 * User Login (Web)
 * POST /api/auth/web/login
 */
router.post('/web/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  validate,
  async (req, res) => {
    await proxyToBackend(req, res, '/api/auth/login');
  }
);

/**
 * User Login (Mobile)
 * POST /api/auth/mobile/login
 * Returns refresh token for mobile devices
 */
router.post('/mobile/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  validate,
  async (req, res) => {
    try {
      // Proxy to backend for authentication
      const axios = require('axios');
      const config = require('../config/config');
      
      const response = await axios.post(`${config.backend.url}/api/users/login`, req.body);
      
      if (response.data.success && response.data.token) {
        // Generate refresh token for mobile
        const refreshToken = generateRefreshToken({
          id: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role
        });
        
        res.json({
          success: true,
          token: response.data.token,
          refreshToken: refreshToken,
          expiresIn: 900, // 15 minutes
          user: response.data.user
        });
      } else {
        res.status(401).json(response.data);
      }
    } catch (error) {
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({
          success: false,
          error: 'Authentication service unavailable'
        });
      }
    }
  }
);

/**
 * Refresh Token
 * POST /api/auth/refresh
 */
router.post('/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token required')
  ],
  validate,
  async (req, res) => {
    const jwt = require('jsonwebtoken');
    const config = require('../config/config');
    
    try {
      const { refreshToken } = req.body;
      
      jwt.verify(refreshToken, config.jwt.secret, (err, user) => {
        if (err) {
          return res.status(403).json({
            success: false,
            error: 'Invalid refresh token'
          });
        }
        
        // Generate new access token
        const newToken = generateToken({
          id: user.id,
          email: user.email,
          role: user.role
        });
        
        res.json({
          success: true,
          token: newToken,
          expiresIn: 900
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Token refresh failed'
      });
    }
  }
);

/**
 * Verify Token
 * GET /api/auth/verify
 */
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * Logout
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, (req, res) => {
  // In a production app, you'd blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
