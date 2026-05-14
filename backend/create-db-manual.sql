-- SQL to run in phpMyAdmin to create the database and basic table structure

-- Create database
CREATE DATABASE IF NOT EXISTS mediconnect;
USE mediconnect;

-- Create a simple test table first
CREATE TABLE IF NOT EXISTS test_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO test_table (name) VALUES ('Connection Test');

-- Display success message
SELECT 'Database and test table created successfully' as message;