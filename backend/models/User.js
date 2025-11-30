const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM(
            'PATIENT', 
            'DOCTOR', 
            'DOCTOR_ASSISTANT',
            'HOSPITAL_ADMIN', 
            'HOSPITAL_STAFF', 
            'EMERGENCY_COORDINATOR', 
            'AMBULANCE_DRIVER', 
            'DIAGNOSTIC_TECHNICIAN', 
            'ADMIN', 
            'SUPER_ADMIN'
        ),
        defaultValue: 'PATIENT'
    },
    image: {
        type: DataTypes.STRING
    },
    dateOfBirth: {
        type: DataTypes.DATE
    },
    gender: {
        type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER')
    },
    address: {
        type: DataTypes.TEXT
    },
    bloodGroup: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    },
    emergencyContact: {
        type: DataTypes.STRING
    },
    hospitalId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Hospitals',
            key: 'id'
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastLogin: {
        type: DataTypes.DATE
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Instance method to check password
User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;