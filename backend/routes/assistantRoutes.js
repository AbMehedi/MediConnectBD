const express = require('express');
const router = express.Router();
const {
    registerAssistant,
    getDoctorAssistants,
    updateAssistantPermissions,
    createTestData
} = require('../controllers/assistantController');

// Test route for development - sync database table
router.post('/test-data', createTestData);

// Register a new assistant for a doctor
router.post('/register', registerAssistant);

// Get all assistants for a doctor
router.get('/doctor/:doctorId', getDoctorAssistants);

// Update assistant permissions
router.put('/:assistantId', updateAssistantPermissions);

module.exports = router;