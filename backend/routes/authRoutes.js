// ===============================================
// Authentication Routes - Direct SQL Implementation
// ===============================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { selectQuery, insertQuery } = require('../config/database');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        const query = `
            SELECT id, name, email, role, phone, gender, password, isActive
            FROM users 
            WHERE email = ? AND isActive = TRUE
        `;
        
        const users = await selectQuery(query, [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Remove password from response
        delete user.password;
        
        res.json({
            success: true,
            user,
            token,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login', 
            error: error.message 
        });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            phone, 
            role = 'PATIENT', 
            gender = 'MALE', 
            dateOfBirth, 
            address, 
            bloodGroup 
        } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email, password, and phone are required' 
            });
        }

        // Check if user already exists
        const existingUserQuery = `
            SELECT id FROM users WHERE email = ? OR phone = ?
        `;
        const existingUsers = await selectQuery(existingUserQuery, [email, phone]);
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email or phone already exists' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `
            INSERT INTO users (name, email, password, phone, role, gender, dateOfBirth, address, bloodGroup, isActive, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW())
        `;
        
        const result = await insertQuery(query, [
            name, 
            email, 
            hashedPassword, 
            phone, 
            role.toUpperCase(), 
            gender.toUpperCase(), 
            dateOfBirth || null, 
            address || null, 
            bloodGroup || null
        ]);

        // Generate token for immediate login
        const token = jwt.sign(
            { userId: result.insertId, email, role: role.toUpperCase() },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            success: true,
            user: {
                id: result.insertId,
                name,
                email,
                phone,
                role: role.toUpperCase(),
                gender: gender.toUpperCase()
            },
            token,
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration', 
            error: error.message 
        });
    }
});

// GET /api/auth/profile/:userId
router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const query = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.phone,
                u.role,
                u.gender,
                u.dateOfBirth,
                u.address,
                u.bloodGroup,
                u.isActive,
                CASE 
                    WHEN u.role = 'DOCTOR' THEN JSON_OBJECT(
                        'doctorId', d.id,
                        'specialization', d.specialization,
                        'bmdcNumber', d.bmdcNumber,
                        'experience', d.experienceYears,
                        'consultationFee', d.consultationFee,
                        'hospitalId', d.hospitalId,
                        'hospitalName', h.name,
                        'roomNumber', d.roomNumber,
                        'available', d.available,
                        'rating', d.rating
                    )
                    ELSE NULL
                END as doctorInfo
            FROM users u
            LEFT JOIN doctors d ON u.id = d.userId
            LEFT JOIN hospitals h ON d.hospitalId = h.id
            WHERE u.id = ? AND u.isActive = TRUE
        `;
        
        const users = await selectQuery(query, [userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Profile Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

module.exports = router;