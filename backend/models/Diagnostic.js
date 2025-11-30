const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Diagnostic = sequelize.define('Diagnostic', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    doctorId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Doctors',
            key: 'id'
        }
    },
    hospitalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Hospitals',
            key: 'id'
        }
    },
    appointmentId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Appointments',
            key: 'id'
        }
    },
    testName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    testCode: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('Blood Test', 'Urine Test', 'X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'ECG', 'Echo', 'Biopsy', 'Other'),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    instructions: {
        type: DataTypes.TEXT
    },
    // Scheduling
    scheduledDate: {
        type: DataTypes.DATEONLY
    },
    scheduledTime: {
        type: DataTypes.TIME
    },
    estimatedDuration: {
        type: DataTypes.INTEGER // minutes
    },
    // Status
    status: {
        type: DataTypes.ENUM('Ordered', 'Scheduled', 'In-Progress', 'Completed', 'Cancelled', 'Report Ready'),
        defaultValue: 'Ordered'
    },
    priority: {
        type: DataTypes.ENUM('Normal', 'Urgent', 'STAT'),
        defaultValue: 'Normal'
    },
    // Patient Information (Snapshots)
    patientName: {
        type: DataTypes.STRING
    },
    patientAge: {
        type: DataTypes.INTEGER
    },
    patientGender: {
        type: DataTypes.STRING
    },
    patientPhone: {
        type: DataTypes.STRING
    },
    // Results
    results: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    normalRange: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    abnormalFindings: {
        type: DataTypes.TEXT
    },
    technologistNotes: {
        type: DataTypes.TEXT
    },
    radiologistNotes: {
        type: DataTypes.TEXT
    },
    reportSummary: {
        type: DataTypes.TEXT
    },
    // Files & Images
    images: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    reportFile: {
        type: DataTypes.STRING
    },
    attachments: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    // Costs
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    finalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    paymentStatus: {
        type: DataTypes.ENUM('Pending', 'Paid', 'Partial', 'Refunded'),
        defaultValue: 'Pending'
    },
    // Tracking
    orderedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    sampleCollectedAt: {
        type: DataTypes.DATE
    },
    testStartedAt: {
        type: DataTypes.DATE
    },
    testCompletedAt: {
        type: DataTypes.DATE
    },
    reportReadyAt: {
        type: DataTypes.DATE
    },
    reportDeliveredAt: {
        type: DataTypes.DATE
    },
    // Quality Control
    qualityControlPassed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    reviewedBy: {
        type: DataTypes.STRING
    },
    reviewedAt: {
        type: DataTypes.DATE
    },
    // Communication
    patientNotified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    doctorNotified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    criticalValue: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    criticalValueNotified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Diagnostic;