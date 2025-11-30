const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DoctorAssistant = sequelize.define('DoctorAssistant', {
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
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Doctors',
            key: 'id'
        }
    },
    // Permission system for what assistant can do
    permissions: {
        type: DataTypes.JSON,
        defaultValue: ['view', 'schedule'], // ['view', 'schedule', 'modify', 'cancel', 'communicate']
        comment: 'Array of permissions: view, schedule, modify, cancel, communicate'
    },
    // Level of delegation authority
    delegationLevel: {
        type: DataTypes.ENUM('BASIC', 'ADVANCED', 'FULL'),
        defaultValue: 'BASIC',
        comment: 'BASIC: view only, ADVANCED: schedule/modify, FULL: all permissions'
    },
    // Working hours when assistant can act on behalf of doctor
    workingHours: {
        type: DataTypes.JSON,
        defaultValue: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '17:00' },
            saturday: { start: '09:00', end: '13:00' },
            sunday: { start: null, end: null }
        },
        comment: 'Working hours when assistant can manage appointments'
    },
    // Emergency delegation - can assistant act during emergencies?
    emergencyAccess: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Can assistant handle appointments during doctor emergencies'
    },
    // Assistant specialization/department
    department: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Department or specialization assistant works in'
    },
    // Status tracking
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    // Delegation start and end dates
    delegationStartDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    delegationEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Optional end date for temporary assistants'
    },
    // Notes from doctor about this assistant
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Doctor notes about assistant responsibilities'
    }
});

module.exports = DoctorAssistant;