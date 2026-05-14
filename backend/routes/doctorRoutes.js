// ===============================================
// Doctor Routes - Direct SQL Implementation
// ===============================================

const express = require('express');
const { selectQuery, insertQuery, updateQuery } = require('../config/database');

const router = express.Router();

// GET /api/doctors - Get all doctors (main endpoint for frontend)
router.get('/', async (req, res) => {
    try {
        const { search, specialty, hospital } = req.query;
        
        let whereClause = 'WHERE d.available = TRUE AND u.isActive = TRUE';
        let params = [];
        
        if (specialty && specialty !== 'All Specialties') {
            whereClause += ' AND d.specialization LIKE ?';
            params.push(`%${specialty}%`);
        }
        
        if (hospital && hospital !== 'All Hospitals') {
            whereClause += ' AND h.name LIKE ?';
            params.push(`%${hospital}%`);
        }
        
        // Complex search query
        if (search) {
            whereClause += ' AND (u.name LIKE ? OR h.name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const query = `
            SELECT 
                d.id,
                u.name,
                u.email,
                d.specialization,
                h.name as hospital,
                d.bmdcNumber,
                d.experienceYears,
                d.consultationFee,
                d.rating,
                d.experienceYears,
                'Active' as status,
                h.district as location,
                d.roomNumber,
                d.available,
                CONCAT('MBBS, ', d.specialization) as degrees,
                'English, Bengali' as languages,
                TRUE as isVerified
            FROM doctors d
            JOIN users u ON d.userId = u.id
            JOIN hospitals h ON d.hospitalId = h.id
            ${whereClause}
            ORDER BY d.rating DESC, d.experienceYears DESC
        `;
        
        const doctors = await selectQuery(query, params);
        
        // Format data to match frontend expectations
        const formattedDoctors = doctors.map(doc => ({
            id: doc.id,
            name: doc.name,
            email: doc.email,
            image: '/images/default-doctor.png', // Default image since we don't have image column
            specialization: doc.specialization,
            hospital: doc.hospital,
            bmdcNumber: doc.bmdcNumber,
            fees: { 
                online: doc.consultationFee || 800, 
                physical: (doc.consultationFee * 1.5) || 1200 
            },
            rating: doc.rating || 4.5,
            status: doc.status,
            location: doc.location,
            experienceYears: doc.experienceYears || 5,
            degrees: doc.degrees ? doc.degrees.split(', ') : ['MBBS'],
            languages: doc.languages ? doc.languages.split(', ') : ['English', 'Bengali'],
            isVerified: doc.isVerified || true,
            available: doc.available
        }));
        
        res.json({
            success: true,
            data: formattedDoctors
        });
    } catch (error) {
        console.error('Get Doctors Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

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
                d.consultationFee,
                d.roomNumber,
                d.available,
                d.rating,
                d.totalPatients,
                d.maxPatientsPerDay,
                h.id as hospitalId,
                h.name as hospitalName,
                h.district,
                h.address as hospitalAddress,
                h.phone as hospitalPhone,
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