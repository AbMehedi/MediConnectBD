const express = require('express');
const router = express.Router();
const { selectQuery } = require('../config/database');

// Test route to directly query user data
router.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        console.log('🔍 Direct database query for user:', userId);
        
        const users = await selectQuery(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];
        console.log('📊 Raw database data:', {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            bio: user.bio,
            address: user.address
        });

        res.json(user);
    } catch (error) {
        console.error('❌ Direct query error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;