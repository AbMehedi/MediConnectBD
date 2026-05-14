-- Active: 1764451925428@@127.0.0.1@3306
-- ===============================================
-- DATABASE VERIFICATION SCRIPT
-- Run these queries to test your MediConnect DB
-- ===============================================

-- 1. VERIFY DATABASE AND TABLES EXIST
-- ===============================================
SHOW DATABASES LIKE 'mediconnect';

USE mediconnect;

SHOW TABLES;

-- Check table structures
DESCRIBE users;
DESCRIBE hospitals;
DESCRIBE doctors;
DESCRIBE appointments;

-- 2. VERIFY SAMPLE DATA WAS INSERTED
-- ===============================================
SELECT 'HOSPITALS' as table_name, COUNT(*) as record_count FROM hospitals
UNION ALL
SELECT 'USERS', COUNT(*) FROM users
UNION ALL
SELECT 'DOCTORS', COUNT(*) FROM doctors
UNION ALL
SELECT 'APPOINTMENTS', COUNT(*) FROM appointments
UNION ALL
SELECT 'QUEUES', COUNT(*) FROM queues
UNION ALL
SELECT 'EMERGENCIES', COUNT(*) FROM emergencies
UNION ALL
SELECT 'MEDICAL_RECORDS', COUNT(*) FROM medical_records
UNION ALL
SELECT 'PAYMENTS', COUNT(*) FROM payments;

-- 3. TEST BASIC DATA RETRIEVAL
-- ===============================================

-- Show all hospitals
SELECT id, name, district, type, availableBeds FROM hospitals;

-- Show all users with their roles
SELECT id, name, email, role, phone, gender FROM users;

-- Show doctors with hospital info
SELECT 
    u.name as doctor_name,
    d.specialization,
    d.consultationFee,
    h.name as hospital_name,
    d.available
FROM doctors d
JOIN users u ON d.userId = u.id
JOIN hospitals h ON d.hospitalId = h.id;

-- 4. TEST GUI QUERIES (These should work for your frontend)
-- ===============================================

-- Test hospital dropdown data
SELECT 
    id,
    name,
    district,
    CONCAT(name, ' - ', district) as displayText
FROM hospitals 
WHERE isActive = TRUE 
ORDER BY name;

-- Test doctor search
SELECT 
    d.id,
    u.name as doctorName,
    d.specialization,
    d.consultationFee,
    d.roomNumber,
    h.name as hospitalName,
    d.rating
FROM doctors d
JOIN users u ON d.userId = u.id
JOIN hospitals h ON d.hospitalId = h.id
WHERE d.available = TRUE AND u.isActive = TRUE
ORDER BY d.rating DESC;

-- Test specializations for dropdown
SELECT DISTINCT 
    specialization as value,
    specialization as label
FROM doctors d
JOIN users u ON d.userId = u.id
WHERE d.available = TRUE AND u.isActive = TRUE
ORDER BY specialization;

-- 5. TEST INSERT/UPDATE OPERATIONS
-- ===============================================

-- Test inserting a new patient
INSERT INTO users (name, email, password, phone, role, gender, address, bloodGroup) 
VALUES ('Test Patient', 'test@patient.com', 'hashedpassword123', '01700000000', 'PATIENT', 'MALE', 'Test Address', 'B+');

-- Verify insert worked
SELECT * FROM users WHERE email = 'test@patient.com';

-- Test updating the patient
UPDATE users SET phone = '01800000000' WHERE email = 'test@patient.com';

-- Verify update worked
SELECT name, email, phone FROM users WHERE email = 'test@patient.com';

-- 6. TEST APPOINTMENT BOOKING PROCESS
-- ===============================================

-- Get a doctor ID for testing
SET @doctorId = (SELECT id FROM doctors LIMIT 1);
SET @patientId = (SELECT id FROM users WHERE role = 'PATIENT' LIMIT 1);
SET @hospitalId = (SELECT hospitalId FROM doctors WHERE id = @doctorId);

-- Book a test appointment
INSERT INTO appointments (patientId, doctorId, hospitalId, appointmentDate, appointmentTime, type, consultationFee, status)
SELECT @patientId, @doctorId, @hospitalId, CURDATE() + INTERVAL 1 DAY, '10:00:00', 'Consultation', d.consultationFee, 'Scheduled'
FROM doctors d WHERE d.id = @doctorId;

-- Verify appointment was created
SELECT 
    a.id,
    u.name as patient_name,
    d_user.name as doctor_name,
    h.name as hospital_name,
    a.appointmentDate,
    a.appointmentTime,
    a.status,
    a.consultationFee
FROM appointments a
JOIN users u ON a.patientId = u.id
JOIN doctors d ON a.doctorId = d.id
JOIN users d_user ON d.userId = d_user.id
JOIN hospitals h ON a.hospitalId = h.id
ORDER BY a.createdAt DESC
LIMIT 1;

-- 7. TEST QUEUE FUNCTIONALITY
-- ===============================================

-- Add patient to queue
INSERT INTO queues (hospitalId, doctorId, patientId, queueNumber, queueDate, estimatedWaitTime, status)
SELECT 
    @hospitalId, @doctorId, @patientId,
    COALESCE(MAX(queueNumber), 0) + 1,
    CURDATE(),
    (COALESCE(MAX(queueNumber), 0) + 1) * 15,
    'Waiting'
FROM queues 
WHERE doctorId = @doctorId AND queueDate = CURDATE();

-- Check queue status
SELECT 
    q.queueNumber,
    u.name as patient_name,
    q.status,
    q.estimatedWaitTime,
    d_user.name as doctor_name
FROM queues q
JOIN users u ON q.patientId = u.id
JOIN doctors d ON q.doctorId = d.id
JOIN users d_user ON d.userId = d_user.id
WHERE q.queueDate = CURDATE()
ORDER BY q.queueNumber;

-- 8. TEST EMERGENCY FUNCTIONALITY
-- ===============================================

-- Report test emergency
INSERT INTO emergencies (patientName, patientPhone, patientAge, gender, emergencyType, description, location, priority, status)
VALUES ('Emergency Test Patient', '01900000000', 30, 'MALE', 'Heart Attack', 'Test emergency case', 'Test Location', 'High', 'Reported');

-- Check emergency was created
SELECT 
    id,
    patientName,
    emergencyType,
    priority,
    status,
    reportedAt,
    description
FROM emergencies 
WHERE patientName = 'Emergency Test Patient';

-- 9. TEST DASHBOARD QUERIES
-- ===============================================

-- Test system statistics
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'PATIENT' AND isActive = TRUE) as totalPatients,
    (SELECT COUNT(*) FROM users WHERE role = 'DOCTOR' AND isActive = TRUE) as totalDoctors,
    (SELECT COUNT(*) FROM hospitals WHERE isActive = TRUE) as totalHospitals,
    (SELECT COUNT(*) FROM appointments WHERE appointmentDate = CURDATE()) as todayAppointments,
    (SELECT COUNT(*) FROM emergencies WHERE status IN ('Reported', 'Dispatched', 'Treating')) as activeEmergencies;

-- Test patient dashboard query
SELECT 
    (SELECT COUNT(*) FROM appointments 
     WHERE patientId = @patientId AND appointmentDate >= CURDATE() 
     AND status IN ('Scheduled', 'Confirmed')) as upcomingAppointments,
    
    (SELECT COUNT(*) FROM queues 
     WHERE patientId = @patientId AND queueDate = CURDATE() 
     AND status IN ('Waiting', 'Called')) as inQueue;

-- 10. VERIFICATION SUMMARY
-- ===============================================

SELECT 
    'Database Verification Complete!' as message,
    NOW() as timestamp;

-- Check foreign key relationships are working
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM doctors d 
              JOIN users u ON d.userId = u.id 
              JOIN hospitals h ON d.hospitalId = h.id) > 0 
        THEN '✅ PASSED: Foreign key relationships working'
        ELSE '❌ FAILED: Foreign key relationships broken'
    END as relationship_test;

-- Check indexes are working (should be fast)
EXPLAIN SELECT * FROM users WHERE email = 'test@patient.com';
EXPLAIN SELECT * FROM doctors WHERE specialization = 'Cardiology';

-- Final status
SELECT 
    'VERIFICATION RESULTS:' as results,
    CONCAT(
        '• Tables: ', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'mediconnect'), 
        ' • Users: ', (SELECT COUNT(*) FROM users),
        ' • Doctors: ', (SELECT COUNT(*) FROM doctors),
        ' • Hospitals: ', (SELECT COUNT(*) FROM hospitals),
        ' • Appointments: ', (SELECT COUNT(*) FROM appointments)
    ) as summary;

-- Clean up test data (optional - uncomment if you want to remove test records)
-- DELETE FROM users WHERE email = 'test@patient.com';
-- DELETE FROM emergencies WHERE patientName = 'Emergency Test Patient';