// ===============================================
// Appointment Routes - Direct SQL Implementation
// ===============================================

const express = require('express');
const { selectQuery, insertQuery, updateQuery } = require('../config/database');

const router = express.Router();

// POST /api/appointments/book - Book new appointment
router.post('/book', async (req, res) => {
    try {
        const { 
            patientId, 
            doctorId, 
            hospitalId, 
            appointmentDate, 
            appointmentTime, 
            type = 'Consultation',
            symptoms = null
        } = req.body;

        if (!patientId || !doctorId || !hospitalId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: 'Patient, doctor, hospital, date and time are required'
            });
        }

        // Get consultation fee from doctor
        const feeQuery = `SELECT feesPhysical as consultationFee FROM doctors WHERE id = ?`;
        const doctors = await selectQuery(feeQuery, [doctorId]);
        
        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        const consultationFee = doctors[0].consultationFee;
        
        // Insert appointment
        const query = `
            INSERT INTO appointments (
                patientId, doctorId, hospitalId, appointmentDate, 
                appointmentTime, type, consultationFee, symptoms, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled')
        `;
        
        const result = await insertQuery(query, [
            patientId, doctorId, hospitalId, appointmentDate, 
            appointmentTime, type, consultationFee, symptoms
        ]);
        
        res.status(201).json({
            success: true,
            appointmentId: result.insertId,
            consultationFee,
            message: 'Appointment booked successfully'
        });
    } catch (error) {
        console.error('Book Appointment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during booking',
            error: error.message
        });
    }
});

// GET /api/appointments/patient/:patientId - Get patient appointments
router.get('/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const { status, limit = 10 } = req.query;
        
        let whereClause = 'WHERE a.patientId = ?';
        let params = [patientId];
        
        if (status) {
            whereClause += ' AND a.status = ?';
            params.push(status);
        }
        
        const query = `
            SELECT 
                a.id,
                a.appointmentDate,
                a.appointmentTime,
                a.type,
                a.status,
                a.symptoms,
                a.diagnosis,
                a.prescription,
                a.consultationFee,
                a.paymentStatus,
                u.name as doctorName,
                d.specialization,
                d.roomNumber,
                h.name as hospitalName,
                h.address as hospitalAddress,
                h.contact as hospitalPhone,
                DATE_FORMAT(a.appointmentDate, '%d %M %Y') as formattedDate,
                TIME_FORMAT(a.appointmentTime, '%h:%i %p') as formattedTime,
                CASE 
                    WHEN a.appointmentDate = CURDATE() THEN 'Today'
                    WHEN a.appointmentDate = CURDATE() + INTERVAL 1 DAY THEN 'Tomorrow'
                    ELSE DATE_FORMAT(a.appointmentDate, '%d %b %Y')
                END as dateLabel
            FROM appointments a
            JOIN doctors doc ON a.doctorId = doc.id
            JOIN users u ON doc.userId = u.id
            JOIN hospitals h ON a.hospitalId = h.id
            ${whereClause}
            ORDER BY a.appointmentDate DESC, a.appointmentTime DESC
            LIMIT ?
        `;
        
        params.push(parseInt(limit));
        const appointments = await selectQuery(query, params);
        
        res.json({
            success: true,
            appointments
        });
    } catch (error) {
        console.error('Patient Appointments Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// PUT /api/appointments/:id/status - Update appointment status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, diagnosis, prescription } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }
        
        const query = `
            UPDATE appointments 
            SET status = ?, 
                diagnosis = COALESCE(?, diagnosis),
                prescription = COALESCE(?, prescription)
            WHERE id = ?
        `;
        
        const result = await updateQuery(query, [status, diagnosis, prescription, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Appointment status updated successfully'
        });
    } catch (error) {
        console.error('Update Appointment Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;