-- Insert sample user for the doctor
INSERT INTO users (name, email, phone, password, role, isVerified, createdAt, updatedAt) 
VALUES ('Dr. Ahmed Hassan', 'ahmed.hassan@doctor.com', '+8801712345678', '$2b$10$dummyhashedpassword', 'doctor', 1, NOW(), NOW());

-- Insert sample doctor data
INSERT INTO doctors (
    userId, specialization, bmdcNumber, experienceYears, hospitalId, hospitalName,
    department, designation, feesOnline, feesPhysical, education, qualifications,
    about, schedule, roomNumber, languages, maxPatientsPerDay, consultationDuration,
    telemedicineDuration, available, isTelemedicineEnabled, isVerified, rating,
    totalRatings, totalPatients, currentLoad, status, createdAt, updatedAt
) VALUES (
    1, 'Cardiology', 'BMDC12345', 5, 1, 'Dhaka Medical College Hospital',
    'Cardiology', 'Assistant Professor', 500.00, 800.00,
    JSON_ARRAY('MBBS', 'MD (Cardiology)'), 'MBBS from DMC, MD in Cardiology from BSMMU',
    'Experienced cardiologist specializing in heart diseases',
    JSON_OBJECT('monday', '9:00-17:00', 'tuesday', '9:00-17:00', 'wednesday', '9:00-17:00'),
    'Room 201', JSON_ARRAY('Bengali', 'English'), 20, 15, 10, 1, 1, 1, 4.5, 25, 150, 5,
    'Active', NOW(), NOW()
);