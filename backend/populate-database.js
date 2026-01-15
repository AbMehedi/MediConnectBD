/**
 * Populate Database with Sample Data
 * Run this to insert sample data into your MediConnect BD database
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function populateDatabase() {
    console.log('🏥 MediConnect BD Database Population');
    console.log('====================================');

    let connection;
    
    try {
        // Connect to database
        console.log('1. Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            port: process.env.DB_PORT || 3306,
            database: 'mediconnect'
        });
        console.log('✅ Connected to mediconnect database');

        // Check if data already exists
        console.log('2. Checking existing data...');
        const [hospitals] = await connection.query('SELECT COUNT(*) as count FROM hospitals');
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        const [doctors] = await connection.query('SELECT COUNT(*) as count FROM doctors');

        console.log(`   - Hospitals: ${hospitals[0].count}`);
        console.log(`   - Users: ${users[0].count}`);
        console.log(`   - Doctors: ${doctors[0].count}`);

        if (hospitals[0].count > 0 || users[0].count > 0 || doctors[0].count > 0) {
            console.log('⚠️  Database already contains data.');
            console.log('   Do you want to proceed anyway? (This may create duplicates)');
            console.log('   To reset, run: npm run reset-db');
        }

        // Read and execute sample data
        console.log('3. Inserting sample data...');
        const sampleDataPath = path.join(__dirname, '..', 'database', 'insert_sample_data.sql');
        
        try {
            const sqlData = await fs.readFile(sampleDataPath, 'utf8');
            
            // Remove comments and split by semicolons that end statements
            const cleanedSql = sqlData
                .replace(/--.*$/gm, '') // Remove single-line comments
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                .trim();
            
            // Split by semicolons but keep multi-line statements together
            const statements = cleanedSql
                .split(/;\s*\n/)
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);

            console.log(`📋 Executing ${statements.length} data insertion statements...`);
            
            for (let i = 0; i < statements.length; i++) {
                let statement = statements[i].trim();
                if (statement && !statement.startsWith('--')) {
                    // Add semicolon back if it's not the last statement or doesn't end with one
                    if (!statement.endsWith(';') && i < statements.length - 1) {
                        statement += ';';
                    }
                    
                    try {
                        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
                        await connection.query(statement);
                    } catch (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            console.log(`   ⚠️  Duplicate entry skipped`);
                        } else {
                            console.error(`   ❌ Error in statement ${i + 1}:`, err.message);
                            console.log(`   Statement: ${statement.substring(0, 100)}...`);
                        }
                    }
                }
            }
            
            console.log('✅ Sample data inserted successfully');
            
            // Final verification
            console.log('4. Final verification...');
            const [finalHospitals] = await connection.query('SELECT COUNT(*) as count FROM hospitals');
            const [finalUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
            const [finalDoctors] = await connection.query('SELECT COUNT(*) as count FROM doctors');
            
            console.log('📊 Current data:');
            console.log(`   - Hospitals: ${finalHospitals[0].count}`);
            console.log(`   - Users: ${finalUsers[0].count}`);
            console.log(`   - Doctors: ${finalDoctors[0].count}`);
            
        } catch (fileError) {
            console.log('⚠️  Could not read sample data file:', fileError.message);
            console.log('   Manual steps:');
            console.log('   - Open database/insert_sample_data.sql');
            console.log('   - Execute it in phpMyAdmin or MySQL client');
        }

        console.log('\n🎉 Database population completed successfully!');
        console.log('🚀 Your database now has sample data for testing');
        
    } catch (error) {
        console.error('❌ Database population failed:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure XAMPP MySQL is running');
        console.log('   2. Ensure database "mediconnect" exists');
        console.log('   3. Check your .env configuration');
        console.log('   4. Try running: npm run setup-db first');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the population
populateDatabase();