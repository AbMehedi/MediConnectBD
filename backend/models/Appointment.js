const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Appointment = sequelize.define('Appointment', {
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
        allowNull: false,
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
    appointmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    appointmentTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME
    },
    type: {
        type: DataTypes.ENUM('In-Person', 'Telemedicine', 'Emergency', 'Follow-up'),
        allowNull: false,
        defaultValue: 'In-Person'
    },
    priority: {
        type: DataTypes.ENUM('Normal', 'Urgent', 'Emergency'),
        defaultValue: 'Normal'
    },
    status: {
        type: DataTypes.ENUM('Scheduled', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled', 'Missed', 'Rescheduled'),
        defaultValue: 'Scheduled'
    },
    queueNumber: {
        type: DataTypes.INTEGER
    },
    serialNumber: {
        type: DataTypes.STRING // Unique appointment serial
    },
    // Patient Information
    patientName: {
        type: DataTypes.STRING // Snapshot
    },
    patientPhone: {
        type: DataTypes.STRING // Snapshot
    },
    patientAge: {
        type: DataTypes.INTEGER // Snapshot
    },
    patientGender: {
        type: DataTypes.STRING // Snapshot
    },
    // Doctor Information
    doctorName: {
        type: DataTypes.STRING // Snapshot
    },
    doctorSpecialization: {
        type: DataTypes.STRING // Snapshot
    },
    roomNumber: {
        type: DataTypes.STRING
    },
    // Medical Information
    symptoms: {
        type: DataTypes.TEXT
    },
    chiefComplaint: {
        type: DataTypes.TEXT
    },
    medicalHistory: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    allergies: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    currentMedications: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    // Consultation Details
    consultation: {
        type: DataTypes.TEXT
    },
    diagnosis: {
        type: DataTypes.TEXT
    },
    prescription: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    labTests: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    followUpDate: {
        type: DataTypes.DATE
    },
    followUpInstructions: {
        type: DataTypes.TEXT
    },
    // Payment Information
    consultationFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    paymentStatus: {
        type: DataTypes.ENUM('Pending', 'Paid', 'Partial', 'Refunded'),
        defaultValue: 'Pending'
    },
    paymentMethod: {
        type: DataTypes.ENUM('Cash', 'Card', 'Mobile Banking', 'Online'),
        defaultValue: 'Cash'
    },
    paymentReference: {
        type: DataTypes.STRING
    },
    // Telemedicine
    meetingLink: {
        type: DataTypes.STRING
    },
    meetingId: {
        type: DataTypes.STRING
    },
    meetingPassword: {
        type: DataTypes.STRING
    },
    // Tracking
    bookedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    confirmedAt: {
        type: DataTypes.DATE
    },
    startedAt: {
        type: DataTypes.DATE
    },
    completedAt: {
        type: DataTypes.DATE
    },
    cancelledAt: {
        type: DataTypes.DATE
    },
    cancellationReason: {
        type: DataTypes.TEXT
    },
    cancelledBy: {
        type: DataTypes.ENUM('Patient', 'Doctor', 'Hospital', 'System')
    },
    // Rating & Feedback
    patientRating: {
        type: DataTypes.INTEGER
    },
    patientFeedback: {
        type: DataTypes.TEXT
    },
    doctorRating: {
        type: DataTypes.INTEGER
    },
    doctorFeedback: {
        type: DataTypes.TEXT
    },
    // Notes
    doctorNotes: {
        type: DataTypes.TEXT
    },
    adminNotes: {
        type: DataTypes.TEXT
    },
    reminderSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    reminderSentAt: {
        type: DataTypes.DATE
    }
});

module.exports = Appointment;