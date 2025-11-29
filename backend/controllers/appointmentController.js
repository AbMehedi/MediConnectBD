const { Appointment } = require('../models');

// @desc    Get My Appointments
const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            where: { patientId: req.user.id },
            order: [['date', 'DESC']]
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Book Appointment
const bookAppointment = async (req, res) => {
    const { doctorId, doctorName, date, time, type, symptoms } = req.body;

    try {
        // Calculate next queue number
        const count = await Appointment.count({
            where: { doctorId, date }
        });

        const appointment = await Appointment.create({
            patientId: req.user.id,
            patientName: req.user.name,
            doctorId,
            doctorName,
            date,
            time,
            type,
            symptoms,
            queueNumber: count + 1,
            status: 'Confirmed'
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMyAppointments, bookAppointment };