// ===============================================
// Hospital Routes - Direct SQL Implementation
// ===============================================

const express = require('express');
const { selectQuery } = require('../config/database');

const router = express.Router();

// GET /api/hospitals/list - Get all hospitals for dropdown
router.get('/list', async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                name,
                district,
                type,
                totalBeds,
                generalBedsAvailable as availableBeds,
                emergencyServices,
                CONCAT(name, ' - ', district) as displayText
            FROM hospitals 
            WHERE isActive = TRUE 
            ORDER BY name
        `;
        
        const hospitals = await selectQuery(query);
        
        res.json({
            success: true,
            hospitals
        });
    } catch (error) {
        console.error('Hospital List Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// GET /api/hospitals/:id - Get hospital details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                h.*,
                (SELECT COUNT(*) FROM doctors d WHERE d.hospitalId = h.id AND d.available = TRUE) as activeDoctors,
                (SELECT COUNT(*) FROM appointments a WHERE a.hospitalId = h.id AND DATE(a.appointmentDate) = CURDATE()) as todayAppointments
            FROM hospitals h 
            WHERE h.id = ? AND h.isActive = TRUE
        `;
        
        const hospitals = await selectQuery(query, [id]);
        
        if (hospitals.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Hospital not found' 
            });
        }
        
        res.json({
            success: true,
            hospital: hospitals[0]
        });
    } catch (error) {
        console.error('Hospital Details Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// GET /api/hospitals/search - Search hospitals
router.get('/search', async (req, res) => {
    try {
        const { district, type, page = 1, limit = 10 } = req.query;
        
        let whereClause = 'WHERE h.isActive = TRUE';
        let params = [];
        
        if (district) {
            whereClause += ' AND h.district = ?';
            params.push(district);
        }
        
        if (type) {
            whereClause += ' AND h.type = ?';
            params.push(type);
        }
        
        const query = `
            SELECT 
                h.id,
                h.name,
                h.address,
                h.district,
                h.type,
                h.contact as phone,
                h.email,
                h.totalBeds,
                h.generalBedsAvailable as availableBeds,
                h.emergencyServices,
                (SELECT COUNT(*) FROM doctors d WHERE d.hospitalId = h.id AND d.available = TRUE) as activeDoctors
            FROM hospitals h
            ${whereClause}
            ORDER BY h.name
            LIMIT ? OFFSET ?
        `;
        
        const offset = (page - 1) * limit;
        params.push(parseInt(limit), offset);
        
        const hospitals = await selectQuery(query, params);
        
        res.json({
            success: true,
            hospitals,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: hospitals.length
            }
        });
    } catch (error) {
        console.error('Hospital Search Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

module.exports = router;