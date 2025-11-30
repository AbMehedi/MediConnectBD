const { Diagnostic, User, Doctor, Hospital, Appointment } = require('../models');
const { Op } = require('sequelize');

// @desc    Create new diagnostic test order
// @route   POST /api/diagnostic/order
const createDiagnosticOrder = async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            hospitalId,
            appointmentId,
            testName,
            category,
            description,
            instructions,
            scheduledDate,
            scheduledTime,
            priority,
            cost
        } = req.body;

        // Generate unique test code
        const testCode = `DX${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Get patient information
        const patient = await User.findByPk(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Create diagnostic order
        const diagnostic = await Diagnostic.create({
            patientId,
            doctorId,
            hospitalId,
            appointmentId,
            testName,
            testCode,
            category,
            description,
            instructions,
            scheduledDate,
            scheduledTime,
            priority: priority || 'Normal',
            status: 'Ordered',
            patientName: patient.name,
            patientAge: patient.age,
            patientGender: patient.gender,
            patientPhone: patient.phone,
            cost: cost || 0.00,
            finalAmount: cost || 0.00
        });

        res.status(201).json({
            message: 'Diagnostic test ordered successfully',
            diagnostic,
            testCode: diagnostic.testCode
        });
    } catch (error) {
        console.error('Create diagnostic order error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get diagnostic test details
// @route   GET /api/diagnostic/:id
const getDiagnostic = async (req, res) => {
    try {
        const diagnostic = await Diagnostic.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'patient',
                    attributes: ['id', 'name', 'email', 'phone', 'age', 'gender']
                },
                {
                    model: Doctor,
                    as: 'doctor',
                    attributes: ['id', 'specialization'],
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
                },
                {
                    model: Appointment,
                    as: 'appointment',
                    attributes: ['id', 'appointmentDate', 'type']
                }
            ]
        });

        if (!diagnostic) {
            return res.status(404).json({ message: 'Diagnostic test not found' });
        }

        res.json(diagnostic);
    } catch (error) {
        console.error('Get diagnostic error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update diagnostic status
// @route   PUT /api/diagnostic/:id/status
const updateDiagnosticStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            status, 
            results, 
            normalRange, 
            abnormalFindings, 
            technologistNotes, 
            radiologistNotes, 
            reportSummary,
            qualityControlPassed,
            reviewedBy
        } = req.body;

        const diagnostic = await Diagnostic.findByPk(id);

        if (!diagnostic) {
            return res.status(404).json({ message: 'Diagnostic test not found' });
        }

        const updateData = { status };

        // Add timestamps based on status
        if (status === 'Scheduled') {
            // Status changed to scheduled - no specific timestamp needed
        } else if (status === 'In-Progress') {
            updateData.testStartedAt = new Date();
            updateData.sampleCollectedAt = new Date();
        } else if (status === 'Completed') {
            updateData.testCompletedAt = new Date();
        } else if (status === 'Report Ready') {
            updateData.reportReadyAt = new Date();
            updateData.qualityControlPassed = qualityControlPassed || false;
            updateData.reviewedBy = reviewedBy;
            updateData.reviewedAt = new Date();
        }

        // Add test results if provided
        if (results) updateData.results = results;
        if (normalRange) updateData.normalRange = normalRange;
        if (abnormalFindings) updateData.abnormalFindings = abnormalFindings;
        if (technologistNotes) updateData.technologistNotes = technologistNotes;
        if (radiologistNotes) updateData.radiologistNotes = radiologistNotes;
        if (reportSummary) updateData.reportSummary = reportSummary;

        await diagnostic.update(updateData);

        // Notify patient and doctor if report is ready
        if (status === 'Report Ready') {
            await notifyReportReady(diagnostic);
        }

        res.json({
            message: 'Diagnostic status updated successfully',
            diagnostic
        });
    } catch (error) {
        console.error('Update diagnostic status error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get patient's diagnostic tests
// @route   GET /api/diagnostic/patient/:patientId
const getPatientDiagnostics = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { status, category, limit = 10, page = 1 } = req.query;

        const whereClause = { patientId };
        if (status) whereClause.status = status;
        if (category) whereClause.category = category;

        const offset = (page - 1) * limit;

        const diagnostics = await Diagnostic.findAndCountAll({
            where: whereClause,
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
                },
                {
                    model: Hospital,
                    as: 'hospital',
                    attributes: ['name']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['orderedAt', 'DESC']]
        });

        res.json({
            diagnostics: diagnostics.rows,
            totalTests: diagnostics.count,
            totalPages: Math.ceil(diagnostics.count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Get patient diagnostics error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get hospital's diagnostic tests
// @route   GET /api/diagnostic/hospital/:hospitalId
const getHospitalDiagnostics = async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const { status, category, date, priority } = req.query;

        const whereClause = { hospitalId };
        if (status) whereClause.status = status;
        if (category) whereClause.category = category;
        if (date) whereClause.scheduledDate = date;
        if (priority) whereClause.priority = priority;

        const diagnostics = await Diagnostic.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'patient',
                    attributes: ['id', 'name', 'phone']
                },
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
            ],
            order: [['priority', 'DESC'], ['orderedAt', 'ASC']]
        });

        // Group by status for dashboard
        const statusGroups = diagnostics.reduce((acc, test) => {
            if (!acc[test.status]) acc[test.status] = [];
            acc[test.status].push(test);
            return acc;
        }, {});

        res.json({
            diagnostics,
            statusGroups,
            totalTests: diagnostics.length
        });
    } catch (error) {
        console.error('Get hospital diagnostics error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search diagnostics by test code
// @route   GET /api/diagnostic/search/:testCode
const searchByTestCode = async (req, res) => {
    try {
        const { testCode } = req.params;

        const diagnostic = await Diagnostic.findOne({
            where: { testCode },
            include: [
                {
                    model: User,
                    as: 'patient',
                    attributes: ['id', 'name', 'email', 'phone']
                },
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
                },
                {
                    model: Hospital,
                    as: 'hospital',
                    attributes: ['name', 'contact']
                }
            ]
        });

        if (!diagnostic) {
            return res.status(404).json({ message: 'Diagnostic test not found' });
        }

        res.json(diagnostic);
    } catch (error) {
        console.error('Search diagnostic error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get diagnostic statistics
// @route   GET /api/diagnostic/stats/:hospitalId
const getDiagnosticStats = async (req, res) => {
    try {
        const { hospitalId } = req.params;
        const { startDate, endDate } = req.query;

        const whereClause = { hospitalId };
        if (startDate && endDate) {
            whereClause.orderedAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const totalTests = await Diagnostic.count({ where: whereClause });

        const statusStats = await Diagnostic.findAll({
            where: whereClause,
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status']
        });

        const categoryStats = await Diagnostic.findAll({
            where: whereClause,
            attributes: [
                'category',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['category']
        });

        const priorityStats = await Diagnostic.findAll({
            where: whereClause,
            attributes: [
                'priority',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['priority']
        });

        const averageTurnaroundTime = await Diagnostic.findOne({
            where: {
                ...whereClause,
                testCompletedAt: { [Op.not]: null },
                orderedAt: { [Op.not]: null }
            },
            attributes: [
                [sequelize.fn('AVG', 
                    sequelize.literal('TIMESTAMPDIFF(HOUR, orderedAt, testCompletedAt)')
                ), 'avgTurnaroundHours']
            ]
        });

        res.json({
            totalTests,
            statusBreakdown: statusStats,
            categoryBreakdown: categoryStats,
            priorityBreakdown: priorityStats,
            averageTurnaroundHours: Math.round(averageTurnaroundTime?.dataValues?.avgTurnaroundHours || 0)
        });
    } catch (error) {
        console.error('Get diagnostic stats error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper function to notify when report is ready
const notifyReportReady = async (diagnostic) => {
    try {
        // Update notification flags
        await diagnostic.update({
            patientNotified: true,
            doctorNotified: true
        });

        // In a real application, you would send SMS/Email notifications here
        console.log(`Report ready for test ${diagnostic.testCode}: Patient ${diagnostic.patientName}`);
        
        // Check for critical values
        if (diagnostic.criticalValue) {
            await diagnostic.update({
                criticalValueNotified: true
            });
            console.log(`CRITICAL VALUE ALERT for test ${diagnostic.testCode}`);
        }
    } catch (error) {
        console.error('Notify report ready error:', error);
    }
};

module.exports = {
    createDiagnosticOrder,
    getDiagnostic,
    updateDiagnosticStatus,
    getPatientDiagnostics,
    getHospitalDiagnostics,
    searchByTestCode,
    getDiagnosticStats
};