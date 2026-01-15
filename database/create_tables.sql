-- ===============================================
-- MediConnect BD - Core Database Schema (SQL)
-- Simplified Version - 8 Core Tables Only
-- ===============================================

-- 1. USERS TABLE (Patients, Doctors, Admins)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    role ENUM('PATIENT', 'DOCTOR', 'ADMIN') DEFAULT 'PATIENT',
    gender ENUM('MALE', 'FEMALE') DEFAULT 'MALE',
    dateOfBirth DATE,
    address VARCHAR(200),
    bloodGroup ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- 2. HOSPITALS TABLE
CREATE TABLE hospitals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    type ENUM('Public', 'Private') DEFAULT 'Private',
    totalBeds INT DEFAULT 0,
    availableBeds INT DEFAULT 0,
    emergencyServices BOOLEAN DEFAULT TRUE,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_district (district),
    INDEX idx_type (type)
);

-- 3. DOCTORS TABLE
CREATE TABLE doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    hospitalId INT NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    bmdcNumber VARCHAR(20) NOT NULL UNIQUE,
    experienceYears INT DEFAULT 0,
    consultationFee DECIMAL(8,2) DEFAULT 500.00,
    roomNumber VARCHAR(10),
    available BOOLEAN DEFAULT TRUE,
    maxPatientsPerDay INT DEFAULT 20,
    rating DECIMAL(2,1) DEFAULT 0.0,
    totalPatients INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospitalId) REFERENCES hospitals(id),
    INDEX idx_specialization (specialization),
    INDEX idx_hospital (hospitalId)
);

-- 4. APPOINTMENTS TABLE
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patientId INT NOT NULL,
    doctorId INT NOT NULL,
    hospitalId INT NOT NULL,
    appointmentDate DATE NOT NULL,
    appointmentTime TIME NOT NULL,
    type ENUM('Consultation', 'Follow-up', 'Emergency') DEFAULT 'Consultation',
    status ENUM('Scheduled', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    symptoms TEXT,
    diagnosis TEXT,
    prescription TEXT,
    consultationFee DECIMAL(8,2),
    paymentStatus ENUM('Pending', 'Paid') DEFAULT 'Pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patientId) REFERENCES users(id),
    FOREIGN KEY (doctorId) REFERENCES doctors(id),
    FOREIGN KEY (hospitalId) REFERENCES hospitals(id),
    INDEX idx_date (appointmentDate),
    INDEX idx_status (status),
    INDEX idx_patient (patientId),
    INDEX idx_doctor (doctorId)
);

-- 5. QUEUES TABLE (Digital Queue Management)
CREATE TABLE queues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hospitalId INT NOT NULL,
    doctorId INT NOT NULL,
    patientId INT NOT NULL,
    appointmentId INT,
    queueNumber INT NOT NULL,
    queueDate DATE NOT NULL,
    status ENUM('Waiting', 'Called', 'In-Progress', 'Completed', 'Skipped') DEFAULT 'Waiting',
    estimatedWaitTime INT, -- in minutes
    checkedInAt TIMESTAMP NULL,
    calledAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (hospitalId) REFERENCES hospitals(id),
    FOREIGN KEY (doctorId) REFERENCES doctors(id),
    FOREIGN KEY (patientId) REFERENCES users(id),
    FOREIGN KEY (appointmentId) REFERENCES appointments(id),
    INDEX idx_queue_date (queueDate),
    INDEX idx_status (status),
    UNIQUE KEY unique_queue (hospitalId, doctorId, queueDate, queueNumber)
);

-- 6. MEDICAL_RECORDS TABLE (Patient Medical History)
CREATE TABLE medical_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patientId INT NOT NULL,
    doctorId INT NOT NULL,
    appointmentId INT,
    visitDate DATE NOT NULL,
    chiefComplaint TEXT,
    diagnosis TEXT NOT NULL,
    treatment TEXT,
    prescription TEXT,
    labReports TEXT,
    nextVisitDate DATE,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patientId) REFERENCES users(id),
    FOREIGN KEY (doctorId) REFERENCES doctors(id),
    FOREIGN KEY (appointmentId) REFERENCES appointments(id),
    INDEX idx_patient (patientId),
    INDEX idx_visit_date (visitDate)
);

-- 7. EMERGENCIES TABLE (Emergency Cases)
CREATE TABLE emergencies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patientName VARCHAR(100) NOT NULL,
    patientPhone VARCHAR(15),
    patientAge INT,
    gender ENUM('MALE', 'FEMALE'),
    emergencyType ENUM('Accident', 'Heart Attack', 'Stroke', 'Breathing Problem', 'Other') NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200),
    hospitalId INT,
    status ENUM('Reported', 'Dispatched', 'Arrived', 'Treating', 'Resolved') DEFAULT 'Reported',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    reportedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolvedAt TIMESTAMP NULL,
    
    FOREIGN KEY (hospitalId) REFERENCES hospitals(id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_reported_at (reportedAt)
);

-- 8. PAYMENTS TABLE (Simple Payment Tracking)
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointmentId INT NOT NULL,
    patientId INT NOT NULL,
    amount DECIMAL(8,2) NOT NULL,
    paymentMethod ENUM('Cash', 'Card', 'Mobile Banking') DEFAULT 'Cash',
    status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',
    transactionId VARCHAR(100),
    paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (appointmentId) REFERENCES appointments(id),
    FOREIGN KEY (patientId) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_payment_date (paymentDate)
);