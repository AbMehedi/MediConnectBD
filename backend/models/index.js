const sequelize = require('../config/db');
const User = require('./User');
const Doctor = require('./Doctor');
const Hospital = require('./Hospital');
const Appointment = require('./Appointment');
const Ambulance = require('./Ambulance');

// Relationships

// Doctor belongs to a User (1:1)
User.hasOne(Doctor, { foreignKey: 'userId', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'userId' });

// Admin manages a Hospital (1:1 or 1:Many)
Hospital.hasMany(User, { foreignKey: 'hospitalId' });
User.belongsTo(Hospital, { foreignKey: 'hospitalId' });

// Appointments
User.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

module.exports = {
    sequelize,
    User,
    Doctor,
    Hospital,
    Appointment,
    Ambulance
};