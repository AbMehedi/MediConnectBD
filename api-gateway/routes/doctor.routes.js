const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const { cacheMiddleware, clearCache } = require('../middleware/cache');
const { proxyToBackend } = require('../utils/proxy');

/**
 * Get All Doctors (Public)
 * GET /api/doctors
 */
router.get('/',
  optionalAuth,
  cacheMiddleware(300),
  async (req, res) => {
    await proxyToBackend(req, res, '/api/doctors');
  }
);

/**
 * Get Doctor by ID (Public)
 * GET /api/doctors/:id
 */
router.get('/:id',
  optionalAuth,
  cacheMiddleware(300),
  async (req, res) => {
    await proxyToBackend(req, res, `/api/doctors/${req.params.id}`);
  }
);

/**
 * Get Doctor Profile (Authenticated)
 * GET /api/doctors/profile
 */
router.get('/profile/me',
  authenticateToken,
  requireRole('doctor'),
  async (req, res) => {
    await proxyToBackend(req, res, '/api/doctors/profile');
  }
);

/**
 * Update Doctor Profile
 * PUT /api/doctors/profile
 */
router.put('/profile',
  authenticateToken,
  requireRole('doctor'),
  async (req, res) => {
    clearCache('/api/doctors');
    await proxyToBackend(req, res, '/api/doctors/profile');
  }
);

/**
 * Get Doctor Appointments
 * GET /api/doctors/appointments
 */
router.get('/appointments/list',
  authenticateToken,
  requireRole('doctor'),
  async (req, res) => {
    await proxyToBackend(req, res, '/api/doctors/appointments');
  }
);

/**
 * Update Appointment Status
 * PATCH /api/doctors/appointments/:id
 */
router.patch('/appointments/:id',
  authenticateToken,
  requireRole('doctor'),
  async (req, res) => {
    await proxyToBackend(req, res, `/api/doctors/appointments/${req.params.id}`);
  }
);

/**
 * Get Doctor's Patients
 * GET /api/doctors/patients
 */
router.get('/patients/list',
  authenticateToken,
  requireRole('doctor'),
  async (req, res) => {
    await proxyToBackend(req, res, '/api/doctors/patients');
  }
);

/**
 * Add Prescription
 * POST /api/doctors/prescriptions
 */
router.post('/prescriptions',
  authenticateToken,
  requireRole('doctor'),
  async (req, res) => {
    await proxyToBackend(req, res, '/api/doctors/prescriptions');
  }
);

module.exports = router;
