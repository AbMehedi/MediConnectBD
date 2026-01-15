/**
 * Database Setup Script
 * Run this to create the database and tables for MediConnect BD
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    console.log('🏥 MediConnect BD Database Setup');
    console.log('================================');

    let connection;
    
    try {
        // Create connection without specifying database first
        console.log('1. Connecting to MySQL server...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            port: process.env.DB_PORT || 3306
        });
        console.log('✅ Connected to MySQL server');

        // Check if database exists, if not create it
        console.log('2. Checking/creating database...');
        await connection.query('CREATE DATABASE IF NOT EXISTS mediconnect');
        await connection.query('USE mediconnect');
        console.log('✅ Database "mediconnect" ready');

        // Check if tables exist
        console.log('3. Checking existing tables...');
        const [tables] = await connection.query('SHOW TABLES');
        
        if (tables.length === 0) {
            console.log('📋 No tables found. Creating tables from schema...');
            
            // Read and execute SQL schema
            const schemaPath = path.join(__dirname, '..', 'database', 'create_tables.sql');
            
            try {
                const sqlSchema = await fs.readFile(schemaPath, 'utf8');
                
                // Split SQL statements and execute them one by one
                const statements = sqlSchema
                    .split(';')
                    .map(stmt => stmt.trim())
                    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

                console.log(`📋 Executing ${statements.length} SQL statements...`);
                for (const statement of statements) {
                    if (statement.trim()) {
                        await connection.query(statement);
                    }
                }
                
                console.log('✅ All tables created successfully');
            } catch (fileError) {
                console.log('⚠️  Could not read schema file:', fileError.message);
                console.log('   Manual steps:');
                console.log('   - Open database/create_tables.sql');
                console.log('   - Execute it in phpMyAdmin or MySQL client');
            }
        } else {
            console.log(`✅ Found ${tables.length} existing tables`);
        }

        // Final verification
        console.log('4. Final verification...');
        const [finalTables] = await connection.query('SHOW TABLES');
        console.log('📊 Current tables:');
        finalTables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });

        console.log('\n🎉 Database setup completed successfully!');
        console.log('🚀 You can now start the backend server');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure XAMPP MySQL is running');
        console.log('   2. Check your .env configuration');
        console.log('   3. Verify database permissions');
        console.log('   4. Try running: npm run test-db');
    } finally {
        if (connection) {
            await connection.end();
        }
        process.exit(0);
    }
}

// Run the setup
setupDatabase();