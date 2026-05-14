-- ===============================================
-- MediConnect BD - Database Setup Script
-- Run this to initialize the core database
-- ===============================================

-- Step 1: Create database (if not exists)
CREATE DATABASE IF NOT EXISTS mediconnect_core 
CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE mediconnect_core;

-- Step 2: Drop existing tables (clean setup)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS queues;
DROP TABLE IF EXISTS emergencies;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS hospitals;

SET FOREIGN_KEY_CHECKS = 1;

-- Step 3: Execute create_tables.sql content here
-- (Run the create_tables.sql file after this)

-- Step 4: Verify tables created
SHOW TABLES;

-- Step 5: Insert sample data (optional)
-- (Run the operational_queries.sql sample data section)

SELECT 'Database setup completed successfully!' as message;