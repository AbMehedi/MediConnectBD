-- ===============================================
-- GUI FUNCTIONAL QUERIES - Ready for API Integration
-- Use these queries in your backend endpoints
-- ===============================================

-- ==============================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- ==============================================

-- USER LOGIN (POST /api/auth/login)
-- Parameters: email, password
SELECT 
    id,
    name,
    email,
    role,
    phone,
    gender,
    isActive,
    'Login successful' as message
FROM users 
WHERE email = ? AND isActive = TRUE;
-- Usage: const user = await db.query(query, [email]);

-- USER REGISTRATION (POST /api/auth/register)
-- Parameters: name, email, password, phone, role, gender, dateOfBirth, address, bloodGroup
INSERT INTO users (name, email, password, phone, role, gender, dateOfBirth, address, bloodGroup)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
-- Usage: await db.query(query, [name, email, hashedPassword, phone, role, gender, dob, address, bloodGroup]);

-- GET USER PROFILE (GET /api/user/:id)
-- Parameters: userId
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
    CASE 
        WHEN u.role = 'DOCTOR' THEN JSON_OBJECT(
            'specialization', d.specialization,
            'experience', d.experienceYears,
            'consultationFee', d.consultationFee,
            'hospitalName', h.name,
            'roomNumber', d.roomNumber
        )
        ELSE NULL
    END as doctorInfo
FROM users u
LEFT JOIN doctors d ON u.id = d.userId
LEFT JOIN hospitals h ON d.hospitalId = h.id
WHERE u.id = ?;

-- ==============================================
-- 2. HOSPITAL & DOCTOR LISTINGS (For Dropdowns/Search)
-- ==============================================

-- GET ALL HOSPITALS FOR DROPDOWN (GET /api/hospitals/list)
SELECT 
    id,
    name,
    district,
    type,
    availableBeds,
    emergencyServices,
    CONCAT(name, ' - ', district) as displayText
FROM hospitals 
WHERE isActive = TRUE 
ORDER BY name;

-- GET DOCTORS BY HOSPITAL (GET /api/doctors/by-hospital/:hospitalId)
-- Parameters: hospitalId
SELECT 
    d.id,
    u.name as doctorName,
    d.specialization,
    d.experienceYears,
    d.consultationFee,
    d.roomNumber,
    d.available,
    d.rating,
    d.maxPatientsPerDay,
    h.name as hospitalName,
    CONCAT(u.name, ' - ', d.specialization) as displayText
FROM doctors d
JOIN users u ON d.userId = u.id
JOIN hospitals h ON d.hospitalId = h.id
WHERE d.hospitalId = ? AND d.available = TRUE AND u.isActive = TRUE
ORDER BY d.rating DESC, d.experienceYears DESC;

-- SEARCH DOCTORS BY SPECIALIZATION (GET /api/doctors/search)
-- Parameters: specialization (optional), hospitalId (optional), district (optional)
SELECT 
    d.id,
    u.name as doctorName,
    d.specialization,
    d.experienceYears,
    d.consultationFee,
    d.roomNumber,
    d.available,
    d.rating,
    h.name as hospitalName,
    h.district,
    h.address as hospitalAddress,
    h.phone as hospitalPhone
FROM doctors d
JOIN users u ON d.userId = u.id
JOIN hospitals h ON d.hospitalId = h.id
WHERE 1=1
    AND (? IS NULL OR d.specialization LIKE CONCAT('%', ?, '%'))
    AND (? IS NULL OR d.hospitalId = ?)
    AND (? IS NULL OR h.district = ?)
    AND d.available = TRUE 
    AND u.isActive = TRUE
ORDER BY d.rating DESC, d.experienceYears DESC
LIMIT 50;

-- GET SPECIALIZATIONS FOR DROPDOWN (GET /api/doctors/specializations)
SELECT DISTINCT 
    specialization as value,
    specialization as label,
    COUNT(*) as doctorCount
FROM doctors d
JOIN users u ON d.userId = u.id
WHERE d.available = TRUE AND u.isActive = TRUE
GROUP BY specialization
ORDER BY specialization;

-- ==============================================
-- 3. APPOINTMENT MANAGEMENT
-- ==============================================

-- BOOK APPOINTMENT (POST /api/appointments/book)
-- Parameters: patientId, doctorId, hospitalId, appointmentDate, appointmentTime, type
INSERT INTO appointments (patientId, doctorId, hospitalId, appointmentDate, appointmentTime, type, consultationFee, status)
SELECT ?, ?, ?, ?, ?, ?, d.consultationFee, 'Scheduled'
FROM doctors d WHERE d.id = ?;

-- GET PATIENT APPOINTMENTS (GET /api/appointments/patient/:patientId)
-- Parameters: patientId, status (optional)
SELECT 
    a.id,
    a.appointmentDate,
    a.appointmentTime,
    a.type,
    a.status,
    u.name as doctorName,
    d.specialization,
    h.name as hospitalName,
    h.address as hospitalAddress,
    h.phone as hospitalPhone,
    d.roomNumber,
    a.consultationFee,
    a.paymentStatus,
    a.createdAt,
    -- Format for display
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
WHERE a.patientId = ?
    AND (? IS NULL OR a.status = ?)
ORDER BY a.appointmentDate DESC, a.appointmentTime DESC;

-- GET DOCTOR APPOINTMENTS (GET /api/appointments/doctor/:doctorId)
-- Parameters: doctorId, date (optional)
SELECT 
    a.id,
    a.appointmentDate,
    a.appointmentTime,
    a.type,
    a.status,
    u.name as patientName,
    u.phone as patientPhone,
    u.age,
    u.gender,
    a.symptoms,
    a.consultationFee,
    a.paymentStatus,
    -- Queue info if exists
    q.queueNumber,
    q.status as queueStatus,
    TIME_FORMAT(a.appointmentTime, '%h:%i %p') as formattedTime
FROM appointments a
JOIN users u ON a.patientId = u.id
LEFT JOIN queues q ON a.id = q.appointmentId AND q.queueDate = a.appointmentDate
WHERE a.doctorId = ?
    AND (? IS NULL OR a.appointmentDate = ?)
ORDER BY a.appointmentTime;

-- CANCEL APPOINTMENT (PUT /api/appointments/:id/cancel)
-- Parameters: appointmentId, cancellationReason
UPDATE appointments 
SET status = 'Cancelled', 
    cancellationReason = ?,
    cancelledAt = NOW()
WHERE id = ? AND status IN ('Scheduled', 'Confirmed');

-- ==============================================
-- 4. QUEUE MANAGEMENT
-- ==============================================

-- JOIN QUEUE (POST /api/queue/join)
-- Parameters: patientId, doctorId, hospitalId, appointmentId (optional)
INSERT INTO queues (hospitalId, doctorId, patientId, appointmentId, queueNumber, queueDate, estimatedWaitTime, status)
SELECT 
    ?, ?, ?, ?,
    COALESCE(MAX(queueNumber), 0) + 1 as nextQueueNumber,
    CURDATE(),
    (COALESCE(MAX(queueNumber), 0) + 1) * 15 as estimatedWait, -- 15 min per patient
    'Waiting'
FROM queues 
WHERE doctorId = ? AND queueDate = CURDATE();

-- GET QUEUE STATUS (GET /api/queue/status/:patientId)
-- Parameters: patientId
SELECT 
    q.id,
    q.queueNumber,
    q.status,
    q.estimatedWaitTime,
    q.queueDate,
    u.name as doctorName,
    d.specialization,
    d.roomNumber,
    h.name as hospitalName,
    -- Calculate patients ahead
    (SELECT COUNT(*) 
     FROM queues q2 
     WHERE q2.doctorId = q.doctorId 
     AND q2.queueDate = q.queueDate 
     AND q2.queueNumber < q.queueNumber 
     AND q2.status IN ('Waiting', 'Called')) as patientsAhead,
    -- Current queue number being served
    (SELECT MIN(queueNumber) 
     FROM queues q3 
     WHERE q3.doctorId = q.doctorId 
     AND q3.queueDate = q.queueDate 
     AND q3.status = 'In-Progress') as currentlyServing
FROM queues q
JOIN doctors d ON q.doctorId = d.id
JOIN users u ON d.userId = u.id
JOIN hospitals h ON q.hospitalId = h.id
WHERE q.patientId = ? AND q.queueDate = CURDATE() AND q.status != 'Completed'
ORDER BY q.createdAt DESC
LIMIT 1;

-- GET DOCTOR QUEUE (GET /api/queue/doctor/:doctorId)
-- Parameters: doctorId, date (optional, defaults to today)
SELECT 
    q.id,
    q.queueNumber,
    q.status,
    u.name as patientName,
    u.phone as patientPhone,
    q.estimatedWaitTime,
    q.checkedInAt,
    q.calledAt,
    TIME_FORMAT(q.checkedInAt, '%h:%i %p') as checkedInTime,
    -- Show appointment info if exists
    a.appointmentTime,
    a.type as appointmentType
FROM queues q
JOIN users u ON q.patientId = u.id
LEFT JOIN appointments a ON q.appointmentId = a.id
WHERE q.doctorId = ? 
    AND q.queueDate = COALESCE(?, CURDATE())
ORDER BY q.queueNumber;

-- CALL NEXT PATIENT (PUT /api/queue/call-next/:doctorId)
-- Parameters: doctorId
UPDATE queues 
SET status = 'Called', calledAt = NOW() 
WHERE doctorId = ? 
    AND queueDate = CURDATE() 
    AND status = 'Waiting'
    AND queueNumber = (
        SELECT MIN(queueNumber) 
        FROM (SELECT queueNumber FROM queues 
              WHERE doctorId = ? AND queueDate = CURDATE() AND status = 'Waiting') as subq
    );

-- ==============================================
-- 5. EMERGENCY MANAGEMENT
-- ==============================================

-- REPORT EMERGENCY (POST /api/emergency/report)
-- Parameters: patientName, patientPhone, patientAge, gender, emergencyType, description, location, priority
INSERT INTO emergencies (patientName, patientPhone, patientAge, gender, emergencyType, description, location, priority, status)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Reported');

-- GET ACTIVE EMERGENCIES (GET /api/emergency/active)
SELECT 
    id,
    patientName,
    patientPhone,
    patientAge,
    gender,
    emergencyType,
    priority,
    description,
    location,
    status,
    reportedAt,
    -- Time elapsed
    TIMESTAMPDIFF(MINUTE, reportedAt, NOW()) as minutesAgo,
    -- Priority score for sorting
    CASE priority 
        WHEN 'Critical' THEN 1 
        WHEN 'High' THEN 2 
        WHEN 'Medium' THEN 3 
        ELSE 4 
    END as priorityScore,
    -- Formatted time
    DATE_FORMAT(reportedAt, '%h:%i %p') as reportedTime
FROM emergencies 
WHERE status IN ('Reported', 'Dispatched', 'Arrived', 'Treating')
ORDER BY priorityScore, reportedAt;

-- UPDATE EMERGENCY STATUS (PUT /api/emergency/:id/status)
-- Parameters: emergencyId, status, hospitalId (optional)
UPDATE emergencies 
SET status = ?, 
    hospitalId = COALESCE(?, hospitalId),
    resolvedAt = CASE WHEN ? = 'Resolved' THEN NOW() ELSE resolvedAt END
WHERE id = ?;

-- ==============================================
-- 6. DASHBOARD & ANALYTICS
-- ==============================================

-- PATIENT DASHBOARD (GET /api/dashboard/patient/:patientId)
-- Parameters: patientId
SELECT 
    -- Upcoming appointments
    (SELECT COUNT(*) FROM appointments 
     WHERE patientId = ? AND appointmentDate >= CURDATE() AND status IN ('Scheduled', 'Confirmed')) as upcomingAppointments,
    
    -- Current queue position
    (SELECT COUNT(*) FROM queues 
     WHERE patientId = ? AND queueDate = CURDATE() AND status IN ('Waiting', 'Called')) as inQueue,
     
    -- Recent medical records
    (SELECT COUNT(*) FROM medical_records 
     WHERE patientId = ? AND visitDate >= CURDATE() - INTERVAL 30 DAY) as recentVisits,
     
    -- Pending payments
    (SELECT COUNT(*) FROM payments p JOIN appointments a ON p.appointmentId = a.id
     WHERE a.patientId = ? AND p.status = 'Pending') as pendingPayments;

-- DOCTOR DASHBOARD (GET /api/dashboard/doctor/:doctorId)
-- Parameters: doctorId
SELECT 
    -- Today's appointments
    (SELECT COUNT(*) FROM appointments 
     WHERE doctorId = ? AND appointmentDate = CURDATE()) as todayAppointments,
    
    -- Current queue size
    (SELECT COUNT(*) FROM queues 
     WHERE doctorId = ? AND queueDate = CURDATE() AND status IN ('Waiting', 'Called', 'In-Progress')) as currentQueue,
     
    -- Completed today
    (SELECT COUNT(*) FROM appointments 
     WHERE doctorId = ? AND appointmentDate = CURDATE() AND status = 'Completed') as completedToday,
     
    -- Average rating
    (SELECT rating FROM doctors WHERE id = ?) as rating,
    
    -- Total patients served
    (SELECT totalPatients FROM doctors WHERE id = ?) as totalPatients;

-- HOSPITAL DASHBOARD (GET /api/dashboard/hospital/:hospitalId)
-- Parameters: hospitalId
SELECT 
    h.name,
    h.totalBeds,
    h.availableBeds,
    -- Today's stats
    (SELECT COUNT(*) FROM appointments 
     WHERE hospitalId = ? AND appointmentDate = CURDATE()) as todayAppointments,
    
    (SELECT COUNT(*) FROM queues 
     WHERE hospitalId = ? AND queueDate = CURDATE()) as totalQueue,
     
    (SELECT COUNT(*) FROM emergencies 
     WHERE hospitalId = ? AND DATE(reportedAt) = CURDATE()) as todayEmergencies,
     
    -- Active doctors
    (SELECT COUNT(*) FROM doctors d JOIN users u ON d.userId = u.id
     WHERE d.hospitalId = ? AND d.available = TRUE AND u.isActive = TRUE) as activeDoctors
FROM hospitals h
WHERE h.id = ?;

-- SYSTEM STATISTICS (GET /api/dashboard/admin)
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'PATIENT' AND isActive = TRUE) as totalPatients,
    (SELECT COUNT(*) FROM users WHERE role = 'DOCTOR' AND isActive = TRUE) as totalDoctors,
    (SELECT COUNT(*) FROM hospitals WHERE isActive = TRUE) as totalHospitals,
    (SELECT COUNT(*) FROM appointments WHERE appointmentDate = CURDATE()) as todayAppointments,
    (SELECT COUNT(*) FROM emergencies WHERE status IN ('Reported', 'Dispatched', 'Treating')) as activeEmergencies,
    (SELECT COUNT(*) FROM queues WHERE queueDate = CURDATE() AND status IN ('Waiting', 'Called')) as currentQueues;

-- ==============================================
-- 7. MEDICAL RECORDS & REPORTS
-- ==============================================

-- ADD MEDICAL RECORD (POST /api/medical-records)
-- Parameters: patientId, doctorId, appointmentId, diagnosis, prescription, notes, nextVisitDate
INSERT INTO medical_records (patientId, doctorId, appointmentId, visitDate, diagnosis, treatment, prescription, notes, nextVisitDate)
VALUES (?, ?, ?, CURDATE(), ?, '', ?, ?, ?);

-- GET PATIENT MEDICAL HISTORY (GET /api/medical-records/patient/:patientId)
-- Parameters: patientId, limit (optional)
SELECT 
    mr.id,
    mr.visitDate,
    u.name as doctorName,
    d.specialization,
    h.name as hospitalName,
    mr.diagnosis,
    mr.prescription,
    mr.notes,
    mr.nextVisitDate,
    DATE_FORMAT(mr.visitDate, '%d %b %Y') as formattedDate
FROM medical_records mr
JOIN doctors doc ON mr.doctorId = doc.id
JOIN users u ON doc.userId = u.id
JOIN hospitals h ON doc.hospitalId = h.id
WHERE mr.patientId = ?
ORDER BY mr.visitDate DESC
LIMIT COALESCE(?, 10);

-- ==============================================
-- 8. SEARCH & FILTERS
-- ==============================================

-- GLOBAL SEARCH (GET /api/search)
-- Parameters: searchTerm, type (optional: 'doctors', 'hospitals', 'patients')
(SELECT 'doctor' as type, d.id, u.name, d.specialization as subtitle, h.name as location
 FROM doctors d 
 JOIN users u ON d.userId = u.id 
 JOIN hospitals h ON d.hospitalId = h.id
 WHERE (? IS NULL OR ? = 'doctors')
   AND (u.name LIKE CONCAT('%', ?, '%') OR d.specialization LIKE CONCAT('%', ?, '%'))
   AND u.isActive = TRUE AND d.available = TRUE)

UNION ALL

(SELECT 'hospital' as type, h.id, h.name, h.type as subtitle, h.district as location
 FROM hospitals h 
 WHERE (? IS NULL OR ? = 'hospitals')
   AND (h.name LIKE CONCAT('%', ?, '%') OR h.district LIKE CONCAT('%', ?, '%'))
   AND h.isActive = TRUE)

LIMIT 20;