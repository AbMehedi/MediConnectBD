// ===============================================
// MediConnect BD - API Endpoints Structure
// How to use the GUI queries in your Express.js backend
// ===============================================

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mediconnect',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ===============================================
// 1. AUTHENTICATION ENDPOINTS
// ===============================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const query = `
            SELECT id, name, email, role, phone, gender, password, isActive
            FROM users 
            WHERE email = ? AND isActive = TRUE
        `;
        
        const [users] = await db.execute(query, [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Remove password from response
        delete user.password;
        
        res.json({
            success: true,
            user,
            message: 'Login successful'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone, role = 'PATIENT', gender, dateOfBirth, address, bloodGroup } = req.body;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `
            INSERT INTO users (name, email, password, phone, role, gender, dateOfBirth, address, bloodGroup)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [name, email, hashedPassword, phone, role, gender, dateOfBirth, address, bloodGroup]);
        
        res.status(201).json({
            success: true,
            userId: result.insertId,
            message: 'User registered successfully'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ===============================================
// 2. HOSPITAL & DOCTOR ENDPOINTS
// ===============================================

// GET /api/hospitals/list
app.get('/api/hospitals/list', async (req, res) => {
    try {
        const query = `
            SELECT id, name, district, type, availableBeds, emergencyServices,
                   CONCAT(name, ' - ', district) as displayText
            FROM hospitals 
            WHERE isActive = TRUE 
            ORDER BY name
        `;
        
        const [hospitals] = await db.execute(query);
        
        res.json({
            success: true,
            hospitals
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/doctors/search
app.get('/api/doctors/search', async (req, res) => {
    try {
        const { specialization, hospitalId, district, page = 1, limit = 10 } = req.query;
        
        const query = `
            SELECT d.id, u.name as doctorName, d.specialization, d.experienceYears,
                   d.consultationFee, d.roomNumber, d.available, d.rating,
                   h.name as hospitalName, h.district, h.address as hospitalAddress
            FROM doctors d
            JOIN users u ON d.userId = u.id
            JOIN hospitals h ON d.hospitalId = h.id
            WHERE d.available = TRUE AND u.isActive = TRUE
                AND (? IS NULL OR d.specialization LIKE CONCAT('%', ?, '%'))
                AND (? IS NULL OR d.hospitalId = ?)
                AND (? IS NULL OR h.district = ?)
            ORDER BY d.rating DESC, d.experienceYears DESC
            LIMIT ? OFFSET ?
        `;
        
        const offset = (page - 1) * limit;
        const [doctors] = await db.execute(query, [
            specialization, specialization, 
            hospitalId, hospitalId, 
            district, district, 
            parseInt(limit), 
            offset
        ]);
        
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ===============================================
// 3. APPOINTMENT ENDPOINTS
// ===============================================

// POST /api/appointments/book
app.post('/api/appointments/book', async (req, res) => {
    try {
        const { patientId, doctorId, hospitalId, appointmentDate, appointmentTime, type = 'Consultation' } = req.body;
        
        // Get consultation fee
        const feeQuery = `SELECT consultationFee FROM doctors WHERE id = ?`;
        const [feeResult] = await db.execute(feeQuery, [doctorId]);
        
        if (feeResult.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        const consultationFee = feeResult[0].consultationFee;
        
        const query = `
            INSERT INTO appointments (patientId, doctorId, hospitalId, appointmentDate, appointmentTime, type, consultationFee, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Scheduled')
        `;
        
        const [result] = await db.execute(query, [patientId, doctorId, hospitalId, appointmentDate, appointmentTime, type, consultationFee]);
        
        res.status(201).json({
            success: true,
            appointmentId: result.insertId,
            message: 'Appointment booked successfully',
            consultationFee
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/appointments/patient/:patientId
app.get('/api/appointments/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const { status } = req.query;
        
        const query = `
            SELECT a.id, a.appointmentDate, a.appointmentTime, a.type, a.status,
                   u.name as doctorName, d.specialization, h.name as hospitalName,
                   h.address as hospitalAddress, d.roomNumber, a.consultationFee,
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
            WHERE a.patientId = ? AND (? IS NULL OR a.status = ?)
            ORDER BY a.appointmentDate DESC, a.appointmentTime DESC
        `;
        
        const [appointments] = await db.execute(query, [patientId, status, status]);
        
        res.json({
            success: true,
            appointments
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ===============================================
// 4. QUEUE MANAGEMENT ENDPOINTS
// ===============================================

// POST /api/queue/join
app.post('/api/queue/join', async (req, res) => {
    try {
        const { patientId, doctorId, hospitalId, appointmentId } = req.body;
        
        const query = `
            INSERT INTO queues (hospitalId, doctorId, patientId, appointmentId, queueNumber, queueDate, estimatedWaitTime, status)
            SELECT ?, ?, ?, ?,
                   COALESCE(MAX(queueNumber), 0) + 1 as nextQueueNumber,
                   CURDATE(),
                   (COALESCE(MAX(queueNumber), 0) + 1) * 15 as estimatedWait,
                   'Waiting'
            FROM queues 
            WHERE doctorId = ? AND queueDate = CURDATE()
        `;
        
        const [result] = await db.execute(query, [hospitalId, doctorId, patientId, appointmentId, doctorId]);
        
        res.status(201).json({
            success: true,
            queueId: result.insertId,
            message: 'Successfully joined the queue'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/queue/status/:patientId
app.get('/api/queue/status/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        
        const query = `
            SELECT q.id, q.queueNumber, q.status, q.estimatedWaitTime,
                   u.name as doctorName, d.specialization, d.roomNumber,
                   h.name as hospitalName,
                   (SELECT COUNT(*) 
                    FROM queues q2 
                    WHERE q2.doctorId = q.doctorId 
                    AND q2.queueDate = q.queueDate 
                    AND q2.queueNumber < q.queueNumber 
                    AND q2.status IN ('Waiting', 'Called')) as patientsAhead,
                   (SELECT MIN(queueNumber) 
                    FROM queues q3 
                    WHERE q3.doctorId = q.doctorId 
                    AND q3.queueDate = q.queueDate 
                    AND q3.status = 'In-Progress') as currentlyServing
            FROM queues q
            JOIN doctors d ON q.doctorId = d.id
            JOIN users u ON d.userId = u.id
            JOIN hospitals h ON q.hospitalId = h.id
            WHERE q.patientId = ? AND q.queueDate = CURDATE() 
                AND q.status IN ('Waiting', 'Called', 'In-Progress')
            ORDER BY q.createdAt DESC
            LIMIT 1
        `;
        
        const [queues] = await db.execute(query, [patientId]);
        
        if (queues.length === 0) {
            return res.json({
                success: true,
                inQueue: false,
                message: 'Not in any queue today'
            });
        }
        
        res.json({
            success: true,
            inQueue: true,
            queueInfo: queues[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ===============================================
// 5. DASHBOARD ENDPOINTS
// ===============================================

// GET /api/dashboard/patient/:patientId
app.get('/api/dashboard/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM appointments 
                 WHERE patientId = ? AND appointmentDate >= CURDATE() 
                 AND status IN ('Scheduled', 'Confirmed')) as upcomingAppointments,
                
                (SELECT COUNT(*) FROM queues 
                 WHERE patientId = ? AND queueDate = CURDATE() 
                 AND status IN ('Waiting', 'Called')) as inQueue,
                 
                (SELECT COUNT(*) FROM medical_records 
                 WHERE patientId = ? AND visitDate >= CURDATE() - INTERVAL 30 DAY) as recentVisits
        `;
        
        const [dashboard] = await db.execute(query, [patientId, patientId, patientId]);
        
        res.json({
            success: true,
            dashboard: dashboard[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ===============================================
// EXAMPLE USAGE IN FRONTEND (React/JavaScript)
// ===============================================

/*
// Frontend API calls example:

// 1. Login
const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return response.json();
};

// 2. Search doctors
const searchDoctors = async (filters) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/doctors/search?${params}`);
    return response.json();
};

// 3. Book appointment
const bookAppointment = async (appointmentData) => {
    const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
    });
    return response.json();
};

// 4. Get queue status
const getQueueStatus = async (patientId) => {
    const response = await fetch(`/api/queue/status/${patientId}`);
    return response.json();
};

*/

module.exports = { db };