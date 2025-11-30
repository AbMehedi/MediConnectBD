const sequelize = require('../config/db');
const User = require('./User');
const Doctor = require('./Doctor');
const Hospital = require('./Hospital');
const Appointment = require('./Appointment');
const Ambulance = require('./Ambulance');
const Diagnostic = require('./Diagnostic');
const Emergency = require('./Emergency');
const Queue = require('./Queue');

// Define Relationships

// User Relationships
User.hasOne(Doctor, { foreignKey: 'userId', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'userId' });

User.belongsTo(Hospital, { foreignKey: 'hospitalId' });
Hospital.hasMany(User, { foreignKey: 'hospitalId' });

// Appointment Relationships
User.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Hospital.hasMany(Appointment, { foreignKey: 'hospitalId', as: 'hospitalAppointments' });
Appointment.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });

// Doctor-Hospital Relationship
Doctor.belongsTo(Hospital, { foreignKey: 'hospitalId' });
Hospital.hasMany(Doctor, { foreignKey: 'hospitalId', as: 'doctors' });

// Diagnostic Relationships
User.hasMany(Diagnostic, { foreignKey: 'patientId', as: 'patientDiagnostics' });
Diagnostic.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(Diagnostic, { foreignKey: 'doctorId', as: 'doctorDiagnostics' });
Diagnostic.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Hospital.hasMany(Diagnostic, { foreignKey: 'hospitalId', as: 'hospitalDiagnostics' });
Diagnostic.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });

Appointment.hasMany(Diagnostic, { foreignKey: 'appointmentId', as: 'appointmentDiagnostics' });
Diagnostic.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Emergency Relationships
User.hasMany(Emergency, { foreignKey: 'patientId', as: 'patientEmergencies' });
Emergency.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Hospital.hasMany(Emergency, { foreignKey: 'assignedHospitalId', as: 'hospitalEmergencies' });
Emergency.belongsTo(Hospital, { foreignKey: 'assignedHospitalId', as: 'assignedHospital' });

Doctor.hasMany(Emergency, { foreignKey: 'attendingDoctorId', as: 'doctorEmergencies' });
Emergency.belongsTo(Doctor, { foreignKey: 'attendingDoctorId', as: 'attendingDoctor' });

Ambulance.hasMany(Emergency, { foreignKey: 'ambulanceId', as: 'ambulanceEmergencies' });
Emergency.belongsTo(Ambulance, { foreignKey: 'ambulanceId', as: 'ambulance' });

// Queue Relationships
User.hasMany(Queue, { foreignKey: 'patientId', as: 'patientQueues' });
Queue.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

Doctor.hasMany(Queue, { foreignKey: 'doctorId', as: 'doctorQueues' });
Queue.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Hospital.hasMany(Queue, { foreignKey: 'hospitalId', as: 'hospitalQueues' });
Queue.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });

Appointment.hasOne(Queue, { foreignKey: 'appointmentId', as: 'appointmentQueue' });
Queue.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Ambulance-Hospital Relationship
Hospital.hasMany(Ambulance, { foreignKey: 'hospitalId', as: 'ambulances' });
Ambulance.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });

module.exports = {
    sequelize,
    User,
    Doctor,
    Hospital,
    Appointment,
    Ambulance,
    Diagnostic,
    Emergency,
    Queue
};