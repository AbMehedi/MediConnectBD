const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { clearCache, clearAllCache } = require('../middleware/cache');
const { proxyToBackend } = require('../utils/proxy');

/**
 * Get All Users
 * GET /api/admin/users
 */
router.get('/users',
  authenticateToken,
  requireRole('admin', 'superadmin'),
  async (req, res) => {
    await proxyToBackend(req, res, '/api/admin/users');
  }
);

/**
 * Get System Statistics
 * GET /api/admin/statistics
 */
router.get('/statistics',
  authenticateToken,
  requireRole('admin', 'superadmin'),
  async (req, res) => {
    await proxyToBackend(req, res, '/api/admin/statistics');
  }
);

/**
 * Approve/Reject Doctor
 * PATCH /api/admin/doctors/:id/status
 */
router.patch('/doctors/:id/status',
  authenticateToken,
  requireRole('admin', 'superadmin'),
  async (req, res) => {
    clearCache('/api/doctors');
    await proxyToBackend(req, res, `/api/admin/doctors/${req.params.id}/status`);
  }
);

/**
 * Manage Hospital Resources
 * PUT /api/admin/hospitals/:id/resources
 */
router.put('/hospitals/:id/resources',
  authenticateToken,
  requireRole('admin'),
  async (req, res) => {
    clearCache('/api/emergency/hospitals');
    await proxyToBackend(req, res, `/api/admin/hospitals/${req.params.id}/resources`);
  }
);

/**
 * Clear API Cache
 * POST /api/admin/cache/clear
 */
router.post('/cache/clear',
  authenticateToken,
  requireRole('superadmin'),
  (req, res) => {
    const { pattern } = req.body;
    
    if (pattern) {
      clearCache(pattern);
      res.json({
        success: true,
        message: `Cache cleared for pattern: ${pattern}`
      });
    } else {
      clearAllCache();
      res.json({
        success: true,
        message: 'All cache cleared'
      });
    }
  }
);

/**
 * Get API Gateway Health
 * GET /api/admin/health
 */
router.get('/health',
  authenticateToken,
  requireRole('admin', 'superadmin'),
  async (req, res) => {
    const axios = require('axios');
    const config = require('../config/config');
    
    try {
      // Check backend health
      const backendHealth = await axios.get(`${config.backend.url}/health`, { timeout: 5000 });
      
      res.json({
        success: true,
        data: {
          gateway: {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date()
          },
          backend: {
            status: backendHealth.data.status || 'healthy',
            url: config.backend.url
          },
          ai: {
            configured: !!config.gemini.apiKey && config.gemini.apiKey !== 'PLACEHOLDER_API_KEY'
          }
        }
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'Backend service check failed',
        data: {
          gateway: {
            status: 'healthy',
            uptime: process.uptime()
          },
          backend: {
            status: 'unhealthy',
            error: error.message
          }
        }
      });
    }
  }
);

module.exports = router;
