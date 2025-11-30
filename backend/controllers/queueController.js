const { Queue, User, Doctor, Hospital, Appointment } = require('../models');
const { Op } = require('sequelize');

// @desc    Get queue for a specific doctor/hospital
// @route   GET /api/queue/doctor/:doctorId
const getDoctorQueue = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;
        
        const queueDate = date || new Date().toISOString().split('T')[0];
        
        const queue = await Queue.findAll({
            where: {
                doctorId,
                queueDate,
                status: {
                    [Op.in]: ['Waiting', 'Called', 'In-Progress']
                }
            },
            include: [
                {
                    model: User,
                    as: 'patient',
                    attributes: ['id', 'name', 'phone', 'age', 'gender']
                },
                {
                    model: Appointment,
                    as: 'appointment',
                    attributes: ['id', 'type', 'scheduledTime']
                }
            ],
            order: [['queueNumber', 'ASC']]
        });

        res.json({
            queue,
            totalPatients: queue.length,
            currentServing: queue.find(q => q.status === 'In-Progress') || null,
            nextPatient: queue.find(q => q.status === 'Waiting') || null
        });
    } catch (error) {
        console.error('Get doctor queue error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add patient to queue
// @route   POST /api/queue/add
const addToQueue = async (req, res) => {
    try {
        const {
            hospitalId,
            doctorId,
            appointmentId,
            patientId,
            queueType,
            priority,
            symptoms,
            chiefComplaint
        } = req.body;

        // Get current date
        const queueDate = new Date().toISOString().split('T')[0];

        // Get next queue number for this doctor today
        const lastQueue = await Queue.findOne({
            where: { doctorId, queueDate },
            order: [['queueNumber', 'DESC']]
        });

        const queueNumber = lastQueue ? lastQueue.queueNumber + 1 : 1;

        // Generate unique queue ID
        const queueId = `Q${queueDate.replace(/-/g, '')}${doctorId}${queueNumber.toString().padStart(3, '0')}`;

        // Get patient and doctor information
        const patient = await User.findByPk(patientId);
        const doctor = await Doctor.findByPk(doctorId, {
            include: [{ model: User, attributes: ['name'] }]
        });

        if (!patient || !doctor) {
            return res.status(404).json({ message: 'Patient or Doctor not found' });
        }

        // Create queue entry
        const queueEntry = await Queue.create({
            queueId,
            hospitalId,
            doctorId,
            appointmentId,
            patientId,
            queueNumber,
            queueDate,
            queueType: queueType || 'Appointment',
            priority: priority || 'Normal',
            patientName: patient.name,
            patientAge: patient.age,
            patientGender: patient.gender,
            patientPhone: patient.phone,
            doctorName: doctor.User.name,
            doctorSpecialization: doctor.specialization,
            roomNumber: doctor.roomNumber,
            symptoms,
            chiefComplaint,
            status: 'Waiting',
            estimatedWaitTime: queueNumber * (doctor.consultationDuration || 15),
            currentPosition: queueNumber
        });

        res.status(201).json({
            message: 'Added to queue successfully',
            queueEntry,
            queueNumber,
            estimatedWaitTime: queueEntry.estimatedWaitTime
        });
    } catch (error) {
        console.error('Add to queue error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update queue status
// @route   PUT /api/queue/:id/status
const updateQueueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const queueEntry = await Queue.findByPk(id);

        if (!queueEntry) {
            return res.status(404).json({ message: 'Queue entry not found' });
        }

        const updateData = { status };

        // Add timestamps based on status
        if (status === 'Called') {
            updateData.calledAt = new Date();
        } else if (status === 'In-Progress') {
            updateData.consultationStartedAt = new Date();
        } else if (status === 'Completed') {
            updateData.consultationEndedAt = new Date();
            updateData.actualWaitTime = Math.floor((new Date() - queueEntry.checkedInAt) / (1000 * 60));
            updateData.consultationDuration = Math.floor((new Date() - queueEntry.consultationStartedAt) / (1000 * 60));
        }

        await queueEntry.update(updateData);

        // Update queue positions for waiting patients
        if (status === 'Completed' || status === 'Cancelled' || status === 'No-Show') {
            await updateQueuePositions(queueEntry.doctorId, queueEntry.queueDate);
        }

        res.json({
            message: 'Queue status updated successfully',
            queueEntry
        });
    } catch (error) {
        console.error('Update queue status error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get patient's current queue position
// @route   GET /api/queue/patient/:patientId
const getPatientQueuePosition = async (req, res) => {
    try {
        const { patientId } = req.params;
        const today = new Date().toISOString().split('T')[0];

        const queueEntry = await Queue.findOne({
            where: {
                patientId,
                queueDate: today,
                status: {
                    [Op.in]: ['Waiting', 'Called', 'In-Progress']
                }
            },
            include: [
                {
                    model: Doctor,
                    as: 'doctor',
                    attributes: ['id'],
                    include: [
                        {
                            model: User,
                            attributes: ['name']
                        }
                    ]
                }
            ]
        });

        if (!queueEntry) {
            return res.status(404).json({ message: 'No active queue entry found' });
        }

        // Get current position
        const waitingBefore = await Queue.count({
            where: {
                doctorId: queueEntry.doctorId,
                queueDate: today,
                queueNumber: { [Op.lt]: queueEntry.queueNumber },
                status: { [Op.in]: ['Waiting', 'Called', 'In-Progress'] }
            }
        });

        const currentPosition = waitingBefore + 1;
        const estimatedWaitTime = currentPosition * 15; // Assuming 15 min per consultation

        res.json({
            queueEntry,
            currentPosition,
            estimatedWaitTime,
            status: queueEntry.status
        });
    } catch (error) {
        console.error('Get patient queue position error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper function to update queue positions
const updateQueuePositions = async (doctorId, queueDate) => {
    try {
        const waitingPatients = await Queue.findAll({
            where: {
                doctorId,
                queueDate,
                status: 'Waiting'
            },
            order: [['queueNumber', 'ASC']]
        });

        for (let i = 0; i < waitingPatients.length; i++) {
            await waitingPatients[i].update({
                currentPosition: i + 1,
                estimatedWaitTime: (i + 1) * 15
            });
        }
    } catch (error) {
        console.error('Update queue positions error:', error);
    }
};

// @desc    Get queue statistics
// @route   GET /api/queue/stats/:hospitalId
const getQueueStats = async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const { date } = req.query;
        
        const queueDate = date || new Date().toISOString().split('T')[0];

        const stats = await Queue.findAll({
            where: {
                hospitalId,
                queueDate
            },
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status']
        });

        const totalPatients = await Queue.count({
            where: { hospitalId, queueDate }
        });

        const averageWaitTime = await Queue.findOne({
            where: {
                hospitalId,
                queueDate,
                status: 'Completed'
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('actualWaitTime')), 'avgWaitTime']
            ]
        });

        res.json({
            date: queueDate,
            totalPatients,
            averageWaitTime: Math.round(averageWaitTime?.dataValues?.avgWaitTime || 0),
            statusBreakdown: stats
        });
    } catch (error) {
        console.error('Get queue stats error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDoctorQueue,
    addToQueue,
    updateQueueStatus,
    getPatientQueuePosition,
    getQueueStats
};