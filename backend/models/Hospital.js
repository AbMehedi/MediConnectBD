const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Hospital = sequelize.define('Hospital', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    district: {
        type: DataTypes.STRING,
        allowNull: false
    },
    division: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Public', 'Private', 'Diagnostic', 'Specialized'),
        defaultValue: 'Private'
    },
    category: {
        type: DataTypes.ENUM('Primary', 'Secondary', 'Tertiary', 'Quaternary'),
        defaultValue: 'Secondary'
    },
    registrationNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: false
    },
    emergencyContact: {
        type: DataTypes.STRING
    },
    website: {
        type: DataTypes.STRING
    },
    // Bed Management
    totalBeds: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    generalBeds: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    generalBedsAvailable: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    icuBeds: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    icuAvailable: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ccuBeds: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ccuAvailable: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    neonatalBeds: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    neonatalBedsAvailable: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ventilators: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ventilatorsAvailable: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    oxygenBeds: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    oxygenBedsAvailable: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // Services
    services: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    departments: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    specializations: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    diagnosticServices: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    // Emergency Services
    emergencyServices: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    ambulanceServices: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    bloodBank: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Location
    latitude: {
        type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8)
    },
    // Status
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isCovidTreatment: {
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
    establishedYear: {
        type: DataTypes.INTEGER
    },
    accreditation: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    description: {
        type: DataTypes.TEXT
    },
    operatingHours: {
        type: DataTypes.JSON,
        defaultValue: {
            monday: { open: '08:00', close: '22:00' },
            tuesday: { open: '08:00', close: '22:00' },
            wednesday: { open: '08:00', close: '22:00' },
            thursday: { open: '08:00', close: '22:00' },
            friday: { open: '08:00', close: '22:00' },
            saturday: { open: '08:00', close: '18:00' },
            sunday: { open: '08:00', close: '18:00' }
        }
    },
    lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Hospital;