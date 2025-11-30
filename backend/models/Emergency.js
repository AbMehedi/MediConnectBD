const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Emergency = sequelize.define('Emergency', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    emergencyId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    // Patient Information
    patientId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    patientName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    patientAge: {
        type: DataTypes.INTEGER
    },
    patientGender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other')
    },
    patientPhone: {
        type: DataTypes.STRING
    },
    emergencyContactName: {
        type: DataTypes.STRING
    },
    emergencyContactPhone: {
        type: DataTypes.STRING
    },
    // Location Information
    currentLocation: {
        type: DataTypes.TEXT
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8)
    },
    // Emergency Details
    emergencyType: {
        type: DataTypes.ENUM('Medical', 'Accident', 'Cardiac', 'Stroke', 'Trauma', 'Poisoning', 'Burns', 'Other'),
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
        defaultValue: 'Medium'
    },
    triageLevel: {
        type: DataTypes.ENUM('1-Resuscitation', '2-Emergent', '3-Urgent', '4-Less Urgent', '5-Non-Urgent'),
        defaultValue: '3-Urgent'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    symptoms: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    vitalSigns: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    consciousness: {
        type: DataTypes.ENUM('Alert', 'Confused', 'Responds to Voice', 'Responds to Pain', 'Unresponsive'),
        defaultValue: 'Alert'
    },
    // Hospital Assignment
    assignedHospitalId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Hospitals',
            key: 'id'
        }
    },
    assignedHospitalName: {
        type: DataTypes.STRING
    },
    estimatedArrivalTime: {
        type: DataTypes.DATE
    },
    actualArrivalTime: {
        type: DataTypes.DATE
    },
    // Ambulance Information
    ambulanceRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ambulanceId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Ambulances',
            key: 'id'
        }
    },
    ambulanceStatus: {
        type: DataTypes.ENUM('Not Assigned', 'Assigned', 'Dispatched', 'On Route', 'Arrived', 'Transporting', 'Delivered'),
        defaultValue: 'Not Assigned'
    },
    estimatedAmbulanceTime: {
        type: DataTypes.INTEGER // minutes
    },
    // Status Tracking
    status: {
        type: DataTypes.ENUM('Reported', 'Triaged', 'Dispatched', 'In Transit', 'Arrived', 'Treating', 'Discharged', 'Transferred', 'Deceased'),
        defaultValue: 'Reported'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    // Medical Team
    attendingDoctorId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Doctors',
            key: 'id'
        }
    },
    medicalTeam: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    // Treatment Information
    initialAssessment: {
        type: DataTypes.TEXT
    },
    treatment: {
        type: DataTypes.TEXT
    },
    medications: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    procedures: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    outcome: {
        type: DataTypes.ENUM('Discharged', 'Admitted', 'Transferred', 'Deceased', 'Left AMA'),
        defaultValue: 'Discharged'
    },
    disposition: {
        type: DataTypes.TEXT
    },
    // Communication
    reportedBy: {
        type: DataTypes.STRING
    },
    reporterPhone: {
        type: DataTypes.STRING
    },
    reporterRelation: {
        type: DataTypes.STRING
    },
    // Timestamps
    reportedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    triagedAt: {
        type: DataTypes.DATE
    },
    dispatchedAt: {
        type: DataTypes.DATE
    },
    arrivedAt: {
        type: DataTypes.DATE
    },
    treatmentStartedAt: {
        type: DataTypes.DATE
    },
    resolvedAt: {
        type: DataTypes.DATE
    },
    // Additional Information
    allergies: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    medicalHistory: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    currentMedications: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    insurance: {
        type: DataTypes.STRING
    },
    // Quality & Follow-up
    followUpRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    followUpDate: {
        type: DataTypes.DATE
    },
    satisfactionRating: {
        type: DataTypes.INTEGER
    },
    feedback: {
        type: DataTypes.TEXT
    },
    // System fields
    responseTime: {
        type: DataTypes.INTEGER // minutes from report to arrival
    },
    totalTime: {
        type: DataTypes.INTEGER // minutes from report to resolution
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    notes: {
        type: DataTypes.TEXT
    }
});

module.exports = Emergency;