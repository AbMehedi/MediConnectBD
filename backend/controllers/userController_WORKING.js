/**
 * Working User Controller - Registration and Login
 * Tested and functional version
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { selectQuery, insertQuery } = require('../config/database');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res) => {
    console.log('📋 Registration attempt:', { email: req.body.email, name: req.body.name });
    
    const { name, email, password, phone, role } = req.body;

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
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        console.log('💾 Inserting user...');
        const insertResult = await insertQuery(
            'INSERT INTO users (name, email, password, phone, role, isActive, isVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, 0, NOW(), NOW())',
            [name, email, hashedPassword, phone, role || 'PATIENT']
        );

        if (insertResult.insertId) {
            console.log('✅ User created with ID:', insertResult.insertId);
            
            // Retrieve the created user
            const users = await selectQuery(
                'SELECT id, name, email, phone, role, isActive, isVerified, createdAt FROM users WHERE id = ?',
                [insertResult.insertId]
            );

            const newUser = users[0];
            console.log('✅ Registration successful for:', newUser.email);
            
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
            res.status(400).json({ 
                success: false,
                message: 'Failed to create user' 
            });
        }
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/users/login
const authUser = async (req, res) => {
    console.log('🔐 Login attempt for:', req.body.email);
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide email and password' 
            });
        }

        // Find user
        const users = await selectQuery(
            'SELECT id, name, email, phone, password, role, isActive, isVerified FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        const user = users[0];

        if (!user.isActive) {
            return res.status(401).json({ 
                success: false,
                message: 'Account is inactive' 
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
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
            message: 'Server error during login'
        });
    }
};

module.exports = {
    registerUser,
    authUser
};