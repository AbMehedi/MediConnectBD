const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMyAppointments, bookAppointment } = require('../controllers/appointmentController');

const router = express.Router();

router.get('/my', protect, getMyAppointments);
router.post('/', protect, bookAppointment);

module.exports = router;