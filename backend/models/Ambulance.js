const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ambulance = sequelize.define('Ambulance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ambulanceNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    plateNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    hospitalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Hospitals',
            key: 'id'
        }
    },
    // Vehicle Information
    type: {
        type: DataTypes.ENUM('Basic', 'Advanced', 'ICU', 'Neonatal', 'Cardiac', 'Trauma'),
        defaultValue: 'Basic'
    },
    category: {
        type: DataTypes.ENUM('AC', 'Non-AC', 'Freezer'),
        defaultValue: 'Non-AC'
    },
    model: {
        type: DataTypes.STRING
    },
    year: {
        type: DataTypes.INTEGER
    },
    capacity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    // Driver Information
    driverName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    driverPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    driverLicense: {
        type: DataTypes.STRING
    },
    driverExperience: {
        type: DataTypes.INTEGER // years
    },
    // Medical Staff
    paramedic: {
        type: DataTypes.STRING
    },
    paramedicPhone: {
        type: DataTypes.STRING
    },
    nurse: {
        type: DataTypes.STRING
    },
    nursePhone: {
        type: DataTypes.STRING
    },
    // Equipment
    equipment: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    hasOxygen: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    hasVentilator: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    hasDefib: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    hasECG: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    hasStretcher: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    // Status & Location
    status: {
        type: DataTypes.ENUM('Available', 'Dispatched', 'On Route', 'On Scene', 'Transporting', 'At Hospital', 'Out of Service', 'Maintenance'),
        defaultValue: 'Available'
    },
    currentLatitude: {
        type: DataTypes.DECIMAL(10, 8)
    },
    currentLongitude: {
        type: DataTypes.DECIMAL(11, 8)
    },
    baseLatitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false
    },
    baseLongitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false
    },
    lastLocationUpdate: {
        type: DataTypes.DATE
    },
    // Service Area
    serviceRadius: {
        type: DataTypes.INTEGER, // kilometers
        defaultValue: 50
    },
    serviceAreas: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    // Performance Metrics
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        defaultValue: 5.0
    },
    totalRatings: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalTrips: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    averageResponseTime: {
        type: DataTypes.INTEGER, // minutes
        defaultValue: 0
    },
    // Operational Details
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    shift: {
        type: DataTypes.ENUM('Day', 'Night', '24/7'),
        defaultValue: '24/7'
    },
    operatingHours: {
        type: DataTypes.JSON,
        defaultValue: {
            start: '00:00',
            end: '23:59'
        }
    },
    fuelLevel: {
        type: DataTypes.INTEGER, // percentage
        defaultValue: 100
    },
    lastMaintenance: {
        type: DataTypes.DATE
    },
    nextMaintenance: {
        type: DataTypes.DATE
    },
    // Cost Information
    baseCost: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    costPerKm: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    // Emergency Information
    currentEmergencyId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Emergencies',
            key: 'id'
        }
    },
    eta: {
        type: DataTypes.DATE
    },
    dispatchedAt: {
        type: DataTypes.DATE
    },
    arrivedAt: {
        type: DataTypes.DATE
    },
    // Communication
    gpsEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    radioChannel: {
        type: DataTypes.STRING
    },
    communicationDevices: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    // Certification
    licenseExpiry: {
        type: DataTypes.DATE
    },
    insuranceExpiry: {
        type: DataTypes.DATE
    },
    certifications: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    notes: {
        type: DataTypes.TEXT
    }
});

module.exports = Ambulance;