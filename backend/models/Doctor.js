const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Doctor = sequelize.define('Doctor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    specialization: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bmdcNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    experienceYears: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    hospitalId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Hospitals',
            key: 'id'
        }
    },
    hospitalName: {
        type: DataTypes.STRING // Denormalized for quick access
    },
    department: {
        type: DataTypes.STRING
    },
    designation: {
        type: DataTypes.STRING // Assistant Professor, Professor, etc.
    },
    feesOnline: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    feesPhysical: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    education: {
        type: DataTypes.JSON, // Array of education objects
        defaultValue: []
    },
    qualifications: {
        type: DataTypes.TEXT
    },
    about: {
        type: DataTypes.TEXT
    },
    schedule: {
        type: DataTypes.JSON, // Weekly schedule
        defaultValue: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
        }
    },
    roomNumber: {
        type: DataTypes.STRING
    },
    languages: {
        type: DataTypes.JSON,
        defaultValue: ['Bengali', 'English']
    },
    maxPatientsPerDay: {
        type: DataTypes.INTEGER,
        defaultValue: 20
    },
    consultationDuration: {
        type: DataTypes.INTEGER, // minutes
        defaultValue: 15
    },
    telemedicineDuration: {
        type: DataTypes.INTEGER, // minutes
        defaultValue: 10
    },
    available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isTelemedicineEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 0.0
    },
    totalRatings: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalPatients: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    currentLoad: {
        type: DataTypes.INTEGER, // current queue count
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'On Leave', 'Emergency'),
        defaultValue: 'Active'
    },
    lastActive: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Doctor;