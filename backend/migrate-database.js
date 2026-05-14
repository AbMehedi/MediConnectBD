/**
 * Database Migration: Fix User Profile Structure
 * Run this to add missing columns and fix data structure
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateDatabase() {
    console.log('🔧 MediConnect BD - Database Migration');
    console.log('=====================================');

    let connection;
    
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'mediconnect',
            port: process.env.DB_PORT || 3306
        });
        
        console.log('✅ Connected to database');

        // Add missing columns to users table
        console.log('1. Adding missing columns to users table...');
        
        const migrations = [
            {
                name: 'Add updatedAt column',
                query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
            },
            {
                name: 'Add profilePicture column',
                query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS profilePicture VARCHAR(255) NULL'
            },
            {
                name: 'Add lastLogin column',
                query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS lastLogin TIMESTAMP NULL'
            },
            {
                name: 'Add isVerified column',
                query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS isVerified BOOLEAN DEFAULT FALSE'
            },
            {
                name: 'Add emergencyContact column',
                query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS emergencyContact VARCHAR(15) NULL'
            },
            {
                name: 'Add bio column for profiles',
                query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT NULL'
            }
        ];

        for (const migration of migrations) {
            try {
                await connection.query(migration.query);
                console.log(`  ✅ ${migration.name}`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`  ⚠️  ${migration.name} (already exists)`);
                } else {
                    console.log(`  ❌ ${migration.name}: ${error.message}`);
                }
            }
        }

        // Verify current table structure
        console.log('2. Verifying table structure...');
        const [columns] = await connection.query('DESCRIBE users');
        console.log('✅ Current users table columns:');
        columns.forEach(col => {
            console.log(`   - ${col.Field} (${col.Type})`);
        });

        // Show current user data
        console.log('3. Current user data...');
        const [users] = await connection.query('SELECT id, name, email, role, createdAt FROM users ORDER BY id DESC LIMIT 3');
        console.log(`✅ Found ${users.length} users (showing latest 3):`);
        users.forEach(user => {
            console.log(`   - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
        });

        console.log('\n🎉 Database migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
        process.exit(0);
    }
}

// Run migration
migrateDatabase();