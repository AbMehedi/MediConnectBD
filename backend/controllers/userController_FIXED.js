// Complete fix for userController registration function
// This addresses both bio insertion and response data issues

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { selectQuery, insertQuery, updateQuery } = require('../config/database');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user - FIXED VERSION
// @route   POST /api/users/register
const registerUser = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            phone, 
            role, 
            dateOfBirth, 
            gender, 
            address, 
            bloodGroup,
            emergencyContact,
            bio
        } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide all required fields' 
            });
        }

        // Check if user already exists
        const existingUser = await selectQuery(
            'SELECT id FROM users WHERE email = ? OR phone = ?',
            [email, phone]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'User with this email or phone already exists' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user with correct parameter mapping
        const insertResult = await insertQuery(
            `INSERT INTO users 
             (name, email, password, phone, role, dateOfBirth, gender, address, bloodGroup, emergencyContact, bio, isActive, isVerified, createdAt, updatedAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW())`,
            [
                name, 
                email, 
                hashedPassword, 
                phone, 
                role || 'PATIENT', 
                dateOfBirth, 
                gender, 
                address, 
                bloodGroup, 
                emergencyContact, 
                bio
            ]
        );

        if (!insertResult.insertId) {
            return res.status(400).json({ 
                success: false,
                message: 'Failed to create user' 
            });
        }

        // Retrieve the created user with all fields
        const users = await selectQuery(
            `SELECT id, name, email, phone, role, dateOfBirth, gender, address, bloodGroup, 
                    emergencyContact, profilePicture, bio, isActive, isVerified, createdAt 
             FROM users WHERE id = ?`,
            [insertResult.insertId]
        );

        if (users.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'User created but profile could not be retrieved'
            });
        }

        const newUser = users[0];

        // Return complete user profile
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                dateOfBirth: newUser.dateOfBirth,
                gender: newUser.gender,
                address: newUser.address,
                bloodGroup: newUser.bloodGroup,
                emergencyContact: newUser.emergencyContact,
                profilePicture: newUser.profilePicture,
                bio: newUser.bio,
                isActive: Boolean(newUser.isActive),
                isVerified: Boolean(newUser.isVerified),
                createdAt: newUser.createdAt,
                profileComplete: !!(newUser.address && newUser.bio)
            },
            token: generateToken(newUser.id)
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration' 
        });
    }
};

module.exports = { registerUser, generateToken };