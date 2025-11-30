const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Queue = sequelize.define('Queue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    queueId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    // Queue Information
    hospitalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Hospitals',
            key: 'id'
        }
    },
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Doctors',
            key: 'id'
        }
    },
    appointmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Appointments',
            key: 'id'
        }
    },
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    // Queue Details
    queueNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    queueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    queueType: {
        type: DataTypes.ENUM('Appointment', 'Walk-in', 'Emergency', 'Follow-up'),
        defaultValue: 'Appointment'
    },
    priority: {
        type: DataTypes.ENUM('Normal', 'High', 'Emergency'),
        defaultValue: 'Normal'
    },
    // Patient Information (Snapshots)
    patientName: {
        type: DataTypes.STRING,
        allowNull: false
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
    // Doctor Information (Snapshots)
    doctorName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    doctorSpecialization: {
        type: DataTypes.STRING
    },
    roomNumber: {
        type: DataTypes.STRING
    },
    // Status
    status: {
        type: DataTypes.ENUM('Waiting', 'Called', 'In-Progress', 'Completed', 'Skipped', 'Cancelled', 'No-Show'),
        defaultValue: 'Waiting'
    },
    // Timing
    scheduledTime: {
        type: DataTypes.TIME
    },
    estimatedWaitTime: {
        type: DataTypes.INTEGER // minutes
    },
    actualWaitTime: {
        type: DataTypes.INTEGER // minutes
    },
    consultationDuration: {
        type: DataTypes.INTEGER // minutes
    },
    // Tracking Timestamps
    checkedInAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    calledAt: {
        type: DataTypes.DATE
    },
    consultationStartedAt: {
        type: DataTypes.DATE
    },
    consultationEndedAt: {
        type: DataTypes.DATE
    },
    // Position Tracking
    currentPosition: {
        type: DataTypes.INTEGER // Current position in queue
    },
    estimatedCallTime: {
        type: DataTypes.DATE
    },
    // Patient Presence
    isPatientPresent: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastSeenAt: {
        type: DataTypes.DATE
    },
    // Communication
    smsNotificationSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    callNotificationSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    remindersSent: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // Queue Management
    skipCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    skipReason: {
        type: DataTypes.TEXT
    },
    rescheduledFrom: {
        type: DataTypes.DATE
    },
    rescheduledTo: {
        type: DataTypes.DATE
    },
    // Additional Information
    symptoms: {
        type: DataTypes.TEXT
    },
    chiefComplaint: {
        type: DataTypes.TEXT
    },
    isEmergency: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // System Fields
    notes: {
        type: DataTypes.TEXT
    },
    tokenNumber: {
        type: DataTypes.STRING // Physical token number if applicable
    },
    kioskCheckIn: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    checkedInBy: {
        type: DataTypes.ENUM('Patient', 'Staff', 'Kiosk', 'Mobile App'),
        defaultValue: 'Staff'
    }
});

module.exports = Queue;