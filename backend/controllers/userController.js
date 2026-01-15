const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { selectQuery, insertQuery, updateQuery } = require('../config/database');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/users/register
const registerUser = async (req, res) => {
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

    try {
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

        // Insert new user with explicit column mapping
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

        if (insertResult.insertId) {
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
            
            // Return complete user profile data
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
        } else {
            res.status(400).json({ 
                success: false,
                message: 'Failed to create user' 
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration' 
        });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide email and password' 
            });
        }

        // Find user by email with complete profile
        const users = await selectQuery(
            `SELECT id, name, email, phone, password, role, dateOfBirth, gender, address, bloodGroup, 
                    emergencyContact, profilePicture, bio, isActive, isVerified, createdAt 
             FROM users WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        const user = users[0];

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ 
                success: false,
                message: 'Account is inactive. Please contact support.' 
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

        // Update last login timestamp
        await updateQuery(
            'UPDATE users SET lastLogin = NOW(), updatedAt = NOW() WHERE id = ?',
            [user.id]
        );

        // Return user data (exclude password)
        const { password: _, ...userData } = user;
        
        res.json({
            success: true,
            message: 'Login successful',
            user: userData,
            token: generateToken(user.id)
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login' 
        });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = async (req, res) => {
    try {
        const users = await selectQuery(
            `SELECT id, name, email, phone, role, dateOfBirth, gender, address, bloodGroup, 
                    emergencyContact, profilePicture, bio, isActive, isVerified, createdAt, lastLogin
             FROM users WHERE id = ?`,
            [req.user.id]
        );

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
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error retrieving profile' 
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
    try {
        const {
            name,
            phone,
            dateOfBirth,
            gender,
            address,
            bloodGroup,
            emergencyContact,
            bio,
            profilePicture
        } = req.body;

        // Check if user exists
        const users = await selectQuery(
            'SELECT id, phone FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        const user = users[0];

        // Check if phone is being changed and if it's already taken
        if (phone && phone !== user.phone) {
            const phoneCheck = await selectQuery(
                'SELECT id FROM users WHERE phone = ? AND id != ?',
                [phone, req.user.id]
            );
            
            if (phoneCheck.length > 0) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Phone number already registered' 
                });
            }
        }

        // Update user profile
        const updateResult = await updateQuery(
            `UPDATE users SET 
                name = COALESCE(?, name),
                phone = COALESCE(?, phone),
                dateOfBirth = COALESCE(?, dateOfBirth),
                gender = COALESCE(?, gender),
                address = COALESCE(?, address),
                bloodGroup = COALESCE(?, bloodGroup),
                emergencyContact = COALESCE(?, emergencyContact),
                bio = COALESCE(?, bio),
                profilePicture = COALESCE(?, profilePicture),
                updatedAt = NOW()
             WHERE id = ?`,
            [name, phone, dateOfBirth, gender, address, bloodGroup, emergencyContact, bio, profilePicture, req.user.id]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: 'No changes made to profile'
            });
        }

        // Get updated user profile
        const [updatedUser] = await selectQuery(
            `SELECT id, name, email, phone, role, dateOfBirth, gender, address, bloodGroup, 
                    emergencyContact, profilePicture, bio, isActive, isVerified, createdAt, updatedAt
             FROM users WHERE id = ?`,
            [req.user.id]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error updating profile' 
        });
    }
};

module.exports = { 
    registerUser, 
    authUser, 
    getUserProfile, 
    updateUserProfile
};