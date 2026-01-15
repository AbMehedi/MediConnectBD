/**
 * Fixed User Controller for Registration and Login
 * Simplified version that works reliably
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { selectQuery, insertQuery, updateQuery } = require('../config/database');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

// @desc    Register a new user (FIXED VERSION)
// @route   POST /api/users/register
const registerUser = async (req, res) => {
    console.log('📋 Registration attempt:', { email: req.body.email, name: req.body.name });
    
    const { 
        name, 
        email, 
        password, 
        phone, 
        role
    } = req.body;

    try {
        // Validate required fields
        if (!name || !email || !password || !phone) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ 
                success: false,
                message: 'Please provide name, email, password, and phone' 
            });
        }

        // Check if user already exists
        console.log('🔍 Checking for existing user...');
        const existingUser = await selectQuery(
            'SELECT id FROM users WHERE email = ? OR phone = ?',
            [email, phone]
        );
        
        if (existingUser.length > 0) {
            console.log('⚠️  User already exists');
            return res.status(400).json({ 
                success: false,
                message: 'User with this email or phone already exists' 
            });
        }

        // Hash password
        console.log('🔐 Hashing password...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Simple insert with required fields only
        console.log('💾 Inserting user...');
        
        const insertResult = await insertQuery(
            'INSERT INTO users (name, email, password, phone, role, isActive, isVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, 0, NOW(), NOW())',
            [name, email, hashedPassword, phone, role || 'PATIENT']
        );

        if (insertResult.insertId) {
            console.log('✅ User created with ID:', insertResult.insertId);
            
            // Retrieve the created user
            const users = await selectQuery(
                `SELECT id, name, email, phone, role, isActive, isVerified, createdAt 
                 FROM users WHERE id = ?`,
                [insertResult.insertId]
            );

            const newUser = users[0];
            console.log('✅ Registration successful for:', newUser.email);
            
            // Return user data
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    role: newUser.role,
                    isActive: Boolean(newUser.isActive),
                    isVerified: Boolean(newUser.isVerified),
                    createdAt: newUser.createdAt
                },
                token: generateToken(newUser.id)
            });
        } else {
            console.log('❌ Insert failed - no insertId');
            res.status(400).json({ 
                success: false,
                message: 'Failed to create user' 
            });
        }
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Auth user & get token (FIXED VERSION)
// @route   POST /api/users/login
const authUser = async (req, res) => {
    console.log('🔐 Login attempt for:', req.body.email);
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            console.log('❌ Missing login credentials');
            return res.status(400).json({ 
                success: false,
                message: 'Please provide email and password' 
            });
        }

        // Find user by email
        console.log('🔍 Looking up user...');
        const users = await selectQuery(
            `SELECT id, name, email, phone, password, role, isActive, isVerified, createdAt 
             FROM users WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            console.log('❌ User not found');
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        const user = users[0];

        // Check if user is active
        if (!user.isActive) {
            console.log('❌ User account inactive');
            return res.status(401).json({ 
                success: false,
                message: 'Account is inactive. Please contact support.' 
            });
        }

        // Check password
        console.log('🔐 Verifying password...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        console.log('✅ Login successful for:', user.email);

        // Return user data (exclude password)
        const { password: _, ...userData } = user;
        
        res.json({
            success: true,
            message: 'Login successful',
            user: userData,
            token: generateToken(user.id)
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    registerUser,
    authUser
};

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