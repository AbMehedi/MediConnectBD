const { Appointment, User, Doctor, Hospital, Queue } = require('../models');
const { Op } = require('sequelize');

// @desc    Get My Appointments
const getMyAppointments = async (req, res) => {
    try {
        const { status, type, page = 1, limit = 10 } = req.query;
        
        const whereClause = { patientId: req.user.id };
        if (status) whereClause.status = status;
        if (type) whereClause.type = type;

        const offset = (page - 1) * limit;

        const appointments = await Appointment.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Doctor,
                    as: 'doctor',
                    attributes: ['id', 'specialization', 'roomNumber'],
                    include: [
                        {
                            model: User,
                            attributes: ['name', 'phone']
                        }
                    ]
                },
                {
                    model: Hospital,
                    as: 'hospital',
                    attributes: ['id', 'name', 'address', 'contact']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']]
        });

        res.json({
            appointments: appointments.rows,
            totalAppointments: appointments.count,
            totalPages: Math.ceil(appointments.count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Get my appointments error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Book Appointment
const bookAppointment = async (req, res) => {
    try {
        const { 
            doctorId, 
            hospitalId, 
            appointmentDate, 
            appointmentTime, 
            type, 
            priority,
            symptoms, 
            chiefComplaint,
            medicalHistory,
            allergies,
            currentMedications
        } = req.body;

        // Get patient information
        const patient = await User.findByPk(req.user.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Get doctor information
        const doctor = await Doctor.findByPk(doctorId, {
            include: [
                {
                    model: User,
                    attributes: ['name']
                }
            ]
        });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Check if slot is available
        const existingAppointment = await Appointment.findOne({
            where: {
                doctorId,
                appointmentDate,
                appointmentTime,
                status: { [Op.in]: ['Scheduled', 'Confirmed', 'In-Progress'] }
            }
        });

        if (existingAppointment) {
            return res.status(400).json({ message: 'This time slot is already booked' });
        }

        // Calculate queue number for the day
        const dayAppointments = await Appointment.count({
            where: { 
                doctorId, 
                appointmentDate,
                status: { [Op.in]: ['Scheduled', 'Confirmed', 'In-Progress', 'Completed'] }
            }
        });

        // Generate serial number
        const serialNumber = `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Create appointment
        const appointment = await Appointment.create({
            patientId: req.user.id,
            doctorId,
            hospitalId,
            appointmentDate,
            appointmentTime,
            type: type || 'In-Person',
            priority: priority || 'Normal',
            status: 'Scheduled',
            queueNumber: dayAppointments + 1,
            serialNumber,
            // Patient snapshots
            patientName: patient.name,
            patientPhone: patient.phone,
            patientAge: patient.age,
            patientGender: patient.gender,
            // Doctor snapshots
            doctorName: doctor.User.name,
            doctorSpecialization: doctor.specialization,
            roomNumber: doctor.roomNumber,
            // Medical information
            symptoms,
            chiefComplaint,
            medicalHistory: medicalHistory || [],
            allergies: allergies || [],
            currentMedications: currentMedications || [],
            // Payment
            consultationFee: type === 'Telemedicine' ? doctor.feesOnline : doctor.feesPhysical,
            paymentStatus: 'Pending'
        });

        // Create queue entry if appointment is for today
        const today = new Date().toISOString().split('T')[0];
        if (appointmentDate === today) {
            await createQueueEntry(appointment);
        }

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment,
            serialNumber: appointment.serialNumber,
            queueNumber: appointment.queueNumber
        });
    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Doctor's Appointments
// @route   GET /api/appointments/doctor/:doctorId
const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date, status } = req.query;
        
        const whereClause = { doctorId };
        if (date) whereClause.appointmentDate = date;
        if (status) whereClause.status = status;

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'patient',
                    attributes: ['id', 'name', 'phone', 'email', 'age', 'gender']
                }
            ],
            order: [['appointmentTime', 'ASC']]
        });

        res.json({
            appointments,
            totalAppointments: appointments.length,
            date: date || 'all'
        });
    } catch (error) {
        console.error('Get doctor appointments error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Appointment Status
// @route   PUT /api/appointments/:id/status
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            status, 
            consultation, 
            diagnosis, 
            prescription, 
            labTests, 
            followUpDate, 
            followUpInstructions,
            cancellationReason 
        } = req.body;

        const appointment = await Appointment.findByPk(id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const updateData = { status };

        // Add timestamps based on status
        if (status === 'Confirmed') {
            updateData.confirmedAt = new Date();
        } else if (status === 'In-Progress') {
            updateData.startedAt = new Date();
        } else if (status === 'Completed') {
            updateData.completedAt = new Date();
            if (consultation) updateData.consultation = consultation;
            if (diagnosis) updateData.diagnosis = diagnosis;
            if (prescription) updateData.prescription = prescription;
            if (labTests) updateData.labTests = labTests;
            if (followUpDate) updateData.followUpDate = followUpDate;
            if (followUpInstructions) updateData.followUpInstructions = followUpInstructions;
        } else if (status === 'Cancelled') {
            updateData.cancelledAt = new Date();
            updateData.cancellationReason = cancellationReason;
            updateData.cancelledBy = req.user.role === 'DOCTOR' ? 'Doctor' : 
                                   req.user.role === 'PATIENT' ? 'Patient' : 'Hospital';
        } else if (status === 'Rescheduled') {
            updateData.cancelledAt = new Date();
        }

        await appointment.update(updateData);

        // Update queue status if applicable
        if (status === 'In-Progress' || status === 'Completed') {
            await updateQueueStatus(appointment.id, status);
        }

        res.json({
            message: 'Appointment status updated successfully',
            appointment
        });
    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reschedule Appointment
// @route   PUT /api/appointments/:id/reschedule
const rescheduleAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { newDate, newTime, reason } = req.body;

        const appointment = await Appointment.findByPk(id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if new slot is available
        const existingAppointment = await Appointment.findOne({
            where: {
                doctorId: appointment.doctorId,
                appointmentDate: newDate,
                appointmentTime: newTime,
                status: { [Op.in]: ['Scheduled', 'Confirmed', 'In-Progress'] }
            }
        });

        if (existingAppointment) {
            return res.status(400).json({ message: 'New time slot is already booked' });
        }

        // Update appointment
        await appointment.update({
            appointmentDate: newDate,
            appointmentTime: newTime,
            status: 'Rescheduled',
            cancellationReason: reason || 'Rescheduled by patient'
        });

        res.json({
            message: 'Appointment rescheduled successfully',
            appointment
        });
    } catch (error) {
        console.error('Reschedule appointment error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Appointment Details
// @route   GET /api/appointments/:id
const getAppointmentDetails = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'patient',
                    attributes: ['id', 'name', 'email', 'phone', 'age', 'gender', 'bloodGroup']
                },
                {
                    model: Doctor,
                    as: 'doctor',
                    attributes: ['id', 'specialization', 'qualifications', 'experience'],
                    include: [
                        {
                            model: User,
                            attributes: ['name', 'phone', 'email']
                        }
                    ]
                },
                {
                    model: Hospital,
                    as: 'hospital',
                    attributes: ['id', 'name', 'address', 'contact', 'type']
                }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (error) {
        console.error('Get appointment details error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper function to create queue entry
const createQueueEntry = async (appointment) => {
    try {
        const queueId = `Q${appointment.appointmentDate.replace(/-/g, '')}${appointment.doctorId}${appointment.queueNumber.toString().padStart(3, '0')}`;
        
        await Queue.create({
            queueId,
            hospitalId: appointment.hospitalId,
            doctorId: appointment.doctorId,
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            queueNumber: appointment.queueNumber,
            queueDate: appointment.appointmentDate,
            queueType: 'Appointment',
            priority: appointment.priority,
            patientName: appointment.patientName,
            patientAge: appointment.patientAge,
            patientGender: appointment.patientGender,
            patientPhone: appointment.patientPhone,
            doctorName: appointment.doctorName,
            doctorSpecialization: appointment.doctorSpecialization,
            roomNumber: appointment.roomNumber,
            symptoms: appointment.symptoms,
            chiefComplaint: appointment.chiefComplaint,
            scheduledTime: appointment.appointmentTime,
            status: 'Waiting'
        });
    } catch (error) {
        console.error('Create queue entry error:', error);
    }
};

// Helper function to update queue status
const updateQueueStatus = async (appointmentId, status) => {
    try {
        const queueStatus = status === 'In-Progress' ? 'In-Progress' : 'Completed';
        
        await Queue.update(
            { 
                status: queueStatus,
                consultationStartedAt: status === 'In-Progress' ? new Date() : undefined,
                consultationEndedAt: status === 'Completed' ? new Date() : undefined
            },
            { where: { appointmentId } }
        );
    } catch (error) {
        console.error('Update queue status error:', error);
    }
};

module.exports = { 
    getMyAppointments, 
    bookAppointment, 
    getDoctorAppointments, 
    updateAppointmentStatus, 
    rescheduleAppointment, 
    getAppointmentDetails 
};