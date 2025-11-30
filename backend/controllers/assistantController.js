const { User, Doctor, DoctorAssistant } = require('../models');
const { Op } = require('sequelize');
const { faker } = require('@faker-js/faker');

// @desc    Register a new assistant for a doctor
// @route   POST /api/assistants/register
// @access  Doctor only
const registerAssistant = async (req, res) => {
    try {
        // The user ID of the assistant being registered
        const { userId, doctorId, permissions, delegationLevel, workingHours, emergencyAccess, department, notes } = req.body;

        // Validate doctor exists
        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Validate assistant user exists and has the correct role
        const assistantUser = await User.findOne({ where: { id: userId, role: 'DOCTOR_ASSISTANT' } });
        if (!assistantUser) {
            return res.status(404).json({ message: 'Assistant user not found or does not have the DOCTOR_ASSISTANT role' });
        }

        // Check if this assistant is already assigned to this doctor
        const existingAssignment = await DoctorAssistant.findOne({ where: { userId, doctorId } });
        if (existingAssignment) {
            return res.status(409).json({ message: 'This assistant is already assigned to this doctor' });
        }

        // Create DoctorAssistant relationship
        const assistant = await DoctorAssistant.create({
            userId,
            doctorId,
            permissions,
            delegationLevel,
            workingHours,
            emergencyAccess,
            department,
            notes
        });

        res.status(201).json({
            message: 'Assistant registered successfully',
            assistant
        });

    } catch (error) {
        console.error('Error registering assistant:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all assistants for a doctor
// @route   GET /api/assistants/doctor/:doctorId
// @access  Doctor/Admin
const getDoctorAssistants = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const assistants = await DoctorAssistant.findAll({
            where: { doctorId },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email', 'role']
            }]
        });

        if (!assistants || assistants.length === 0) {
            return res.status(404).json({ message: 'No assistants found for this doctor' });
        }

        res.json({ assistants });

    } catch (error) {
        console.error('Error fetching assistants:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update assistant permissions
// @route   PUT /api/assistants/:assistantId
// @access  Doctor only
const updateAssistantPermissions = async (req, res) => {
    try {
        const { assistantId } = req.params;
        const { permissions, delegationLevel, workingHours, emergencyAccess, notes } = req.body;

        const assistant = await DoctorAssistant.findByPk(assistantId);

        if (!assistant) {
            return res.status(404).json({ message: 'Assistant not found' });
        }

        // Update assistant
        assistant.permissions = permissions || assistant.permissions;
        assistant.delegationLevel = delegationLevel || assistant.delegationLevel;
        assistant.workingHours = workingHours || assistant.workingHours;
        assistant.emergencyAccess = emergencyAccess !== undefined ? emergencyAccess : assistant.emergencyAccess;
        assistant.notes = notes || assistant.notes;

        await assistant.save();

        res.json({
            message: 'Assistant permissions updated successfully',
            assistant
        });

    } catch (error) {
        console.error('Error updating assistant:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Test endpoint to create sample assistant data
// @route   POST /api/assistants/test-data
// @access  Development only
const createTestData = async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Test data creation not allowed in production' });
    }
    try {
        // Create a doctor user and profile with random data
        const doctorUser = await User.create({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: 'password', // In a real app, this would be hashed
            phone: faker.phone.number(),
            role: 'DOCTOR',
        });

        const doctorProfile = await Doctor.create({
            userId: doctorUser.id,
            specialization: faker.person.jobArea(),
            bmdcNumber: `BMDC-${faker.string.alphanumeric(10)}`,
            experienceYears: faker.number.int({ min: 1, max: 40 }),
        });

        // Create an assistant user with random data
        const assistantUser = await User.create({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: 'password',
            phone: faker.phone.number(),
            role: 'DOCTOR_ASSISTANT',
        });

        res.status(201).json({
            message: 'Random test users and profiles created successfully',
            doctor: { userId: doctorUser.id, doctorId: doctorProfile.id },
            assistant: { userId: assistantUser.id }
        });
    } catch (error) {
        console.error('Error creating test data:', error);
        res.status(500).json({ message: 'Server error while creating test data' });
    }
};

module.exports = {
    registerAssistant,
    getDoctorAssistants,
    updateAssistantPermissions,
    createTestData
};