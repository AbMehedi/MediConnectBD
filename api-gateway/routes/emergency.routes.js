const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const { proxyToBackend } = require('../utils/proxy');

/**
 * Get Nearby Hospitals
 * GET /api/emergency/hospitals
 */
router.get('/hospitals',
  optionalAuth,
  cacheMiddleware(180),
  async (req, res) => {
    await proxyToBackend(req, res, '/api/emergency/hospitals');
  }
);

/**
 * Get Available Ambulances
 * GET /api/emergency/ambulances
 */
router.get('/ambulances',
  optionalAuth,
  cacheMiddleware(60), // Cache for 1 minute (ambulance availability changes quickly)
  async (req, res) => {
    await proxyToBackend(req, res, '/api/emergency/ambulances');
  }
);

/**
 * Request Emergency Service
 * POST /api/emergency/request
 */
router.post('/request',
  optionalAuth,
  async (req, res) => {
    await proxyToBackend(req, res, '/api/emergency/request');
  }
);

/**
 * Get Emergency Contacts
 * GET /api/emergency/contacts
 */
router.get('/contacts',
  cacheMiddleware(3600), // Cache for 1 hour
  async (req, res) => {
    await proxyToBackend(req, res, '/api/emergency/contacts');
  }
);

/**
 * Track Ambulance
 * GET /api/emergency/track/:requestId
 */
router.get('/track/:requestId',
  optionalAuth,
  async (req, res) => {
    await proxyToBackend(req, res, `/api/emergency/track/${req.params.requestId}`);
  }
);

module.exports = router;
