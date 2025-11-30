const jwt = require('jsonwebtoken');
const { User } = require('../models');

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
        hospitalId 
    } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check for duplicate phone
        const phoneExists = await User.findOne({ where: { phone } });
        if (phoneExists) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }

        // Validate role-specific requirements
        if (role === 'DOCTOR' || role === 'ADMIN') {
            if (!hospitalId) {
                return res.status(400).json({ message: 'Hospital ID is required for doctors and admins' });
            }
        }

        // Create user with comprehensive data
        const userData = {
            name,
            email,
            password,
            phone,
            role: role || 'PATIENT',
            dateOfBirth,
            gender,
            address,
            bloodGroup,
            emergencyContact,
            hospitalId,
            isActive: true,
            isVerified: false,
            lastLogin: new Date()
        };

        const user = await User.create(userData);

        if (user) {
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                address: user.address,
                bloodGroup: user.bloodGroup,
                emergencyContact: user.emergencyContact,
                hospitalId: user.hospitalId,
                isActive: user.isActive,
                isVerified: user.isVerified,
                token: generateToken(user.id),
                message: 'User registered successfully. Please verify your account.'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ 
            where: { email },
            include: [
                {
                    model: require('../models').Hospital,
                    attributes: ['id', 'name', 'type', 'address']
                }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is inactive. Please contact support.' });
        }

        if (await user.matchPassword(password)) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                address: user.address,
                bloodGroup: user.bloodGroup,
                emergencyContact: user.emergencyContact,
                hospitalId: user.hospitalId,
                hospital: user.Hospital,
                isActive: user.isActive,
                isVerified: user.isVerified,
                lastLogin: user.lastLogin,
                token: generateToken(user.id),
                message: 'Login successful'
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: require('../models').Hospital,
                    attributes: ['id', 'name', 'type', 'address', 'contact']
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: error.message });
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
            emergencyContact
        } = req.body;

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if phone is being changed and if it's already taken
        if (phone && phone !== user.phone) {
            const phoneExists = await User.findOne({ where: { phone } });
            if (phoneExists) {
                return res.status(400).json({ message: 'Phone number already registered' });
            }
        }

        // Update user data
        const updatedUser = await user.update({
            name: name || user.name,
            phone: phone || user.phone,
            dateOfBirth: dateOfBirth || user.dateOfBirth,
            gender: gender || user.gender,
            address: address || user.address,
            bloodGroup: bloodGroup || user.bloodGroup,
            emergencyContact: emergencyContact || user.emergencyContact
        });

        res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            dateOfBirth: updatedUser.dateOfBirth,
            gender: updatedUser.gender,
            address: updatedUser.address,
            bloodGroup: updatedUser.bloodGroup,
            emergencyContact: updatedUser.emergencyContact,
            hospitalId: updatedUser.hospitalId,
            isActive: updatedUser.isActive,
            isVerified: updatedUser.isVerified,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify user account
// @route   POST /api/users/verify/:id
const verifyUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isVerified = true;
        await user.save();

        res.json({ message: 'User verified successfully' });
    } catch (error) {
        console.error('Verify user error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users/all
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, hospital, verified } = req.query;
        
        const whereClause = {};
        if (role) whereClause.role = role;
        if (hospital) whereClause.hospitalId = hospital;
        if (verified !== undefined) whereClause.isVerified = verified === 'true';

        const offset = (page - 1) * limit;

        const users = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: require('../models').Hospital,
                    attributes: ['id', 'name', 'type']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            users: users.rows,
            totalUsers: users.count,
            totalPages: Math.ceil(users.count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get users by role
// @route   GET /api/users/role/:role
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const { hospitalId } = req.query;

        const whereClause = { role, isActive: true };
        if (hospitalId) whereClause.hospitalId = hospitalId;

        const users = await User.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: require('../models').Hospital,
                    attributes: ['id', 'name', 'type']
                }
            ],
            order: [['name', 'ASC']]
        });

        res.json(users);
    } catch (error) {
        console.error('Get users by role error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Deactivate user
// @route   PUT /api/users/deactivate/:id
const deactivateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = false;
        await user.save();

        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Deactivate user error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reactivate user
// @route   PUT /api/users/reactivate/:id
const reactivateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = true;
        await user.save();

        res.json({ message: 'User reactivated successfully' });
    } catch (error) {
        console.error('Reactivate user error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    registerUser, 
    authUser, 
    getUserProfile, 
    updateUserProfile, 
    verifyUser, 
    getAllUsers,
    getUsersByRole,
    deactivateUser,
    reactivateUser
};