const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { cacheMiddleware, clearCache } = require('../middleware/cache');
const { proxyToBackend } = require('../utils/proxy');

/**
 * Get Patient Profile
 * GET /api/patients/profile
 */
router.get('/profile',
  authenticateToken,
  requireRole('PATIENT'),
  cacheMiddleware(120),
  async (req, res) => {
    await proxyToBackend(req, res, '/api/users/profile');
  }
);

/**
 * Update Patient Profile
 * PUT /api/patients/profile
 */
router.put('/profile',
  authenticateToken,
  requireRole('PATIENT'),
  async (req, res) => {
    clearCache('/api/patients/profile');
    await proxyToBackend(req, res, '/api/users/profile');
  }
);

/**
 * Get Patient Appointments
 * GET /api/patients/appointments
 */
router.get('/appointments',
  authenticateToken,
  requireRole('PATIENT'),
  async (req, res) => {
    await proxyToBackend(req, res, `/api/appointments/patient/${req.user.userId}`);
  }
);

/**
 * Book Appointment
 * POST /api/patients/appointments
 */
router.post('/appointments',
  authenticateToken,
  requireRole('PATIENT'),
  async (req, res) => {
    await proxyToBackend(req, res, '/api/appointments/book');
  }
);

/**
 * Cancel Appointment
 * DELETE /api/patients/appointments/:id
 */
router.delete('/appointments/:id',
  authenticateToken,
  requireRole('patient'),
  async (req, res) => {
    await proxyToBackend(req, res, `/api/appointments/${req.params.id}`);
  }
);

/**
 * Get Medical History
 * GET /api/patients/medical-history
 */
router.get('/medical-history',
  authenticateToken,
  requireRole('patient'),
  async (req, res) => {
    await proxyToBackend(req, res, '/api/patients/medical-history');
  }
);

/**
 * Add Medical Record
 * POST /api/patients/medical-records
 */
router.post('/medical-records',
  authenticateToken,
  requireRole('patient'),
  async (req, res) => {
    await proxyToBackend(req, res, '/api/patients/medical-records');
  }
);

module.exports = router;
