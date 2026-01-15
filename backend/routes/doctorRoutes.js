// ===============================================
// Doctor Routes - Direct SQL Implementation
// ===============================================

const express = require('express');
const { selectQuery, insertQuery, updateQuery } = require('../config/database');

const router = express.Router();

// GET /api/doctors/search - Search doctors with filters
router.get('/search', async (req, res) => {
    try {
        const { specialization, hospitalId, district, page = 1, limit = 10 } = req.query;
        
        let whereClause = 'WHERE d.available = TRUE AND u.isActive = TRUE';
        let params = [];
        
        if (specialization) {
            whereClause += ' AND d.specialization LIKE ?';
            params.push(`%${specialization}%`);
        }
        
        if (hospitalId) {
            whereClause += ' AND d.hospitalId = ?';
            params.push(hospitalId);
        }
        
        if (district) {
            whereClause += ' AND h.district = ?';
            params.push(district);
        }
        
        const query = `
            SELECT 
                d.id,
                u.name as doctorName,
                d.specialization,
                d.experienceYears,
                d.feesPhysical as consultationFee,
                d.roomNumber,
                d.available,
                d.rating,
                d.totalPatients,
                d.maxPatientsPerDay,
                h.id as hospitalId,
                h.name as hospitalName,
                h.district,
                h.address as hospitalAddress,
                h.contact as hospitalPhone,
                CONCAT(u.name, ' - ', d.specialization) as displayText
            FROM doctors d
            JOIN users u ON d.userId = u.id
            JOIN hospitals h ON d.hospitalId = h.id
            ${whereClause}
            ORDER BY d.rating DESC, d.experienceYears DESC
            LIMIT ? OFFSET ?
        `;
        
        const offset = (page - 1) * limit;
        params.push(parseInt(limit), offset);
        
        const doctors = await selectQuery(query, params);
        
        res.json({
            success: true,
            doctors,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: doctors.length
            }
        });
    } catch (error) {
        console.error('Doctor Search Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// GET /api/doctors/specializations - Get all specializations for dropdown
router.get('/specializations', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT 
                d.specialization as value,
                d.specialization as label,
                COUNT(*) as doctorCount
            FROM doctors d
            JOIN users u ON d.userId = u.id
            WHERE d.available = TRUE AND u.isActive = TRUE
            GROUP BY d.specialization
            ORDER BY d.specialization
        `;
        
        const specializations = await selectQuery(query);
        
        res.json({
            success: true,
            specializations
        });
    } catch (error) {
        console.error('Specializations Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// GET /api/doctors/:id - Get doctor details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                d.*,
                u.name as doctorName,
                u.email,
                u.phone,
                u.gender,
                h.name as hospitalName,
                h.address as hospitalAddress,
                h.phone as hospitalPhone,
                h.district
            FROM doctors d
            JOIN users u ON d.userId = u.id
            JOIN hospitals h ON d.hospitalId = h.id
            WHERE d.id = ? AND u.isActive = TRUE
        `;
        
        const doctors = await selectQuery(query, [id]);
        
        if (doctors.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Doctor not found' 
            });
        }
        
        res.json({
            success: true,
            doctor: doctors[0]
        });
    } catch (error) {
        console.error('Doctor Details Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

module.exports = router;