-- ===============================================
-- MediConnect BD - GUI Functional SQL Queries
-- Ready for Frontend Integration
-- ===============================================

-- GUI SETUP DATA (Run once to initialize)
-- ===============================================

-- Sample Hospitals for Dropdown/Selection
INSERT INTO hospitals (name, address, district, phone, email, type, totalBeds, availableBeds) 
VALUES 
('Dhaka Medical College Hospital', 'Ramna, Dhaka-1000', 'Dhaka', '02-8626812', 'info@dmch.gov.bd', 'Public', 500, 50),
('Square Hospital', 'Panthapath, Dhaka-1205', 'Dhaka', '02-8144400', 'info@squarehospital.com', 'Private', 300, 25),
('Ibn Sina Hospital', 'Kalyanpur, Dhaka-1216', 'Dhaka', '02-9008008', 'info@ibnsinabd.com', 'Private', 200, 30);

-- Sample Users & Doctors for Testing
INSERT INTO users (name, email, password, phone, role, gender, dateOfBirth, address, bloodGroup) 
VALUES 
('John Doe', 'john@email.com', '$2a$10$hash123', '01712345678', 'PATIENT', 'MALE', '1990-05-15', 'Dhanmondi, Dhaka', 'B+'),
('Sarah Khan', 'sarah@email.com', '$2a$10$hash456', '01787654321', 'PATIENT', 'FEMALE', '1985-12-20', 'Gulshan, Dhaka', 'A+'),
('Dr. Ahmed Hassan', 'dr.ahmed@email.com', '$2a$10$hash789', '01911234567', 'DOCTOR', 'MALE', '1975-08-10', 'Uttara, Dhaka', 'O+'),
('Dr. Fatima Islam', 'dr.fatima@email.com', '$2a$10$hash101', '01987654321', 'DOCTOR', 'FEMALE', '1980-03-25', 'Bashundhara, Dhaka', 'AB+');

INSERT INTO doctors (userId, hospitalId, specialization, bmdcNumber, experienceYears, consultationFee, roomNumber, maxPatientsPerDay) 
VALUES 
(3, 1, 'Cardiology', 'BMDC12345', 15, 1000.00, 'R-101', 25),
(4, 2, 'Pediatrics', 'BMDC67890', 12, 800.00, 'R-205', 30);

-- OPERATIONAL QUERIES
-- ===============================================

-- 1. PATIENT REGISTRATION & LOGIN
-- Register new patient
INSERT INTO users (name, email, password, phone, role, gender, dateOfBirth, address, bloodGroup)
VALUES ('New Patient', 'patient@email.com', '$2a$10$hashedpassword', '01700000000', 'PATIENT', 'MALE', '1995-01-01', 'Dhaka', 'B+');

-- Patient login verification
SELECT id, name, email, role, isActive 
FROM users 
WHERE email = 'patient@email.com' AND role = 'PATIENT' AND isActive = TRUE;

-- 2. DOCTOR MANAGEMENT
-- Get all available doctors with hospital info
SELECT 
    d.id as doctor_id,
    u.name as doctor_name,
    d.specialization,
    d.experienceYears,
    d.consultationFee,
    d.roomNumber,
    h.name as hospital_name,
    h.district,
    d.available,
    d.rating
FROM doctors d
JOIN users u ON d.userId = u.id
JOIN hospitals h ON d.hospitalId = h.id
WHERE d.available = TRUE AND u.isActive = TRUE
ORDER BY d.rating DESC, d.experienceYears DESC;

-- Find doctors by specialization
SELECT 
    u.name as doctor_name,
    d.specialization,
    d.consultationFee,
    h.name as hospital_name,
    d.roomNumber
FROM doctors d
JOIN users u ON d.userId = u.id
JOIN hospitals h ON d.hospitalId = h.id
WHERE d.specialization = 'Cardiology' AND d.available = TRUE;

-- 3. APPOINTMENT BOOKING
-- Book new appointment
INSERT INTO appointments (patientId, doctorId, hospitalId, appointmentDate, appointmentTime, type, consultationFee)
VALUES (1, 1, 1, '2026-01-15', '10:00:00', 'Consultation', 1000.00);

-- Get patient's upcoming appointments
SELECT 
    a.id as appointment_id,
    a.appointmentDate,
    a.appointmentTime,
    a.type,
    a.status,
    u.name as doctor_name,
    d.specialization,
    h.name as hospital_name,
    d.roomNumber,
    a.consultationFee
FROM appointments a
JOIN doctors doc ON a.doctorId = doc.id
JOIN users u ON doc.userId = u.id
JOIN hospitals h ON a.hospitalId = h.id
WHERE a.patientId = 1 AND a.appointmentDate >= CURDATE()
ORDER BY a.appointmentDate, a.appointmentTime;

-- 4. QUEUE MANAGEMENT
-- Add patient to queue
INSERT INTO queues (hospitalId, doctorId, patientId, appointmentId, queueNumber, queueDate, estimatedWaitTime)
VALUES (1, 1, 1, 1, 1, CURDATE(), 30);

-- Get current queue status for a doctor
SELECT 
    q.queueNumber,
    u.name as patient_name,
    q.status,
    q.estimatedWaitTime,
    q.checkedInAt,
    q.calledAt
FROM queues q
JOIN users u ON q.patientId = u.id
WHERE q.doctorId = 1 AND q.queueDate = CURDATE()
ORDER BY q.queueNumber;

-- Get patient's current queue position
SELECT 
    q.queueNumber,
    q.status,
    q.estimatedWaitTime,
    u.name as doctor_name,
    d.roomNumber,
    h.name as hospital_name,
    (SELECT COUNT(*) FROM queues q2 
     WHERE q2.doctorId = q.doctorId 
     AND q2.queueDate = q.queueDate 
     AND q2.queueNumber < q.queueNumber 
     AND q2.status IN ('Waiting', 'Called')) as patients_ahead
FROM queues q
JOIN doctors doc ON q.doctorId = doc.id
JOIN users u ON doc.userId = u.id
JOIN hospitals h ON q.hospitalId = h.id
WHERE q.patientId = 1 AND q.queueDate = CURDATE();

-- 5. MEDICAL RECORDS
-- Add medical record after consultation
INSERT INTO medical_records (patientId, doctorId, appointmentId, visitDate, chiefComplaint, diagnosis, prescription, notes)
VALUES (1, 1, 1, CURDATE(), 'Chest pain', 'Mild hypertension', 'Amlodipine 5mg daily', 'Follow up in 2 weeks');

-- Get patient medical history
SELECT 
    mr.visitDate,
    u.name as doctor_name,
    d.specialization,
    mr.diagnosis,
    mr.prescription,
    mr.notes,
    mr.nextVisitDate
FROM medical_records mr
JOIN doctors doc ON mr.doctorId = doc.id
JOIN users u ON doc.userId = u.id
WHERE mr.patientId = 1
ORDER BY mr.visitDate DESC;

-- 6. EMERGENCY CASES
-- Report emergency case
INSERT INTO emergencies (patientName, patientPhone, patientAge, gender, emergencyType, description, location, hospitalId, priority)
VALUES ('Emergency Patient', '01700000000', 35, 'MALE', 'Heart Attack', 'Severe chest pain, difficulty breathing', 'Dhanmondi 27', 1, 'Critical');

-- Get active emergency cases
SELECT 
    id,
    patientName,
    patientPhone,
    emergencyType,
    priority,
    description,
    location,
    status,
    reportedAt
FROM emergencies 
WHERE status IN ('Reported', 'Dispatched', 'Arrived', 'Treating')
ORDER BY 
    CASE priority 
        WHEN 'Critical' THEN 1 
        WHEN 'High' THEN 2 
        WHEN 'Medium' THEN 3 
        ELSE 4 
    END, 
    reportedAt;

-- 7. HOSPITAL DASHBOARD QUERIES
-- Hospital daily statistics
SELECT 
    h.name as hospital_name,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'Completed' THEN a.id END) as completed_appointments,
    COUNT(DISTINCT q.id) as queue_patients,
    COUNT(DISTINCT e.id) as emergency_cases
FROM hospitals h
LEFT JOIN appointments a ON h.id = a.hospitalId AND DATE(a.appointmentDate) = CURDATE()
LEFT JOIN queues q ON h.id = q.hospitalId AND q.queueDate = CURDATE()
LEFT JOIN emergencies e ON h.id = e.hospitalId AND DATE(e.reportedAt) = CURDATE()
WHERE h.id = 1
GROUP BY h.id, h.name;

-- Doctor's daily patient load
SELECT 
    u.name as doctor_name,
    d.specialization,
    COUNT(a.id) as scheduled_appointments,
    COUNT(q.id) as queue_patients,
    d.maxPatientsPerDay,
    (COUNT(a.id) * 100.0 / d.maxPatientsPerDay) as load_percentage
FROM doctors d
JOIN users u ON d.userId = u.id
LEFT JOIN appointments a ON d.id = a.doctorId AND a.appointmentDate = CURDATE()
LEFT JOIN queues q ON d.id = q.doctorId AND q.queueDate = CURDATE()
WHERE d.hospitalId = 1
GROUP BY d.id, u.name, d.specialization, d.maxPatientsPerDay
ORDER BY load_percentage DESC;

-- 8. PAYMENT QUERIES
-- Record payment
INSERT INTO payments (appointmentId, patientId, amount, paymentMethod, status, transactionId)
VALUES (1, 1, 1000.00, 'Card', 'Completed', 'TXN123456789');

-- Get payment history for patient
SELECT 
    p.paymentDate,
    p.amount,
    p.paymentMethod,
    p.status,
    u.name as doctor_name,
    a.appointmentDate
FROM payments p
JOIN appointments a ON p.appointmentId = a.id
JOIN doctors d ON a.doctorId = d.id
JOIN users u ON d.userId = u.id
WHERE p.patientId = 1
ORDER BY p.paymentDate DESC;

-- UTILITY QUERIES
-- ===============================================

-- Get system statistics
SELECT 
    'Total Patients' as metric, COUNT(*) as count FROM users WHERE role = 'PATIENT'
UNION ALL
SELECT 'Total Doctors', COUNT(*) FROM users WHERE role = 'DOCTOR'
UNION ALL
SELECT 'Total Hospitals', COUNT(*) FROM hospitals WHERE isActive = TRUE
UNION ALL
SELECT 'Today Appointments', COUNT(*) FROM appointments WHERE appointmentDate = CURDATE()
UNION ALL
SELECT 'Active Emergencies', COUNT(*) FROM emergencies WHERE status IN ('Reported', 'Dispatched', 'Treating');