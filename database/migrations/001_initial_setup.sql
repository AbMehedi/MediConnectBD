-- Migration: Create initial database structure
-- Run this SQL file to create the database schema

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS diagnostics;
DROP TABLE IF EXISTS queues;
DROP TABLE IF EXISTS emergencies;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS ambulances;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS hospitals;

SET FOREIGN_KEY_CHECKS = 1;

-- Now run create_tables.sql to recreate with proper structure