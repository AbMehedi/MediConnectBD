/**
 * Simple Database Populator
 * Executes SQL files directly without parsing
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function executeSqlFile(connection, filePath) {
    const filename = path.basename(filePath);
    console.log(`📋 Executing ${filename}...`);
    
    try {
        const sqlContent = await fs.readFile(filePath, 'utf8');
        
        // Execute the entire file content as one query (MySQL supports multiple statements)
        await connection.execute(sqlContent);
        
        console.log(`✅ ${filename} executed successfully`);
        return true;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⚠️  ${filename}: Some entries already exist (skipped duplicates)`);
            return true;
        } else {
            console.error(`❌ Error executing ${filename}:`, error.message);
            return false;
        }
    }
}

async function populateDatabaseSimple() {
    console.log('🏥 MediConnect BD - Simple Database Population');
    console.log('==============================================');

    let connection;
    
    try {
        // Connect to database
        console.log('1. Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            port: process.env.DB_PORT || 3306,
            database: 'mediconnect',
            multipleStatements: true // Enable multiple statements
        });
        console.log('✅ Connected to mediconnect database');

        // Execute sample data files
        const databaseDir = path.join(__dirname, '..', 'database');
        const sqlFiles = [
            'insert_sample_data.sql',
            'insert_sample_doctor.sql'
        ];

        for (const sqlFile of sqlFiles) {
            const filePath = path.join(databaseDir, sqlFile);
            
            try {
                await fs.access(filePath);
                await executeSqlFile(connection, filePath);
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.log(`⚠️  ${sqlFile} not found, skipping...`);
                } else {
                    throw err;
                }
            }
        }

        // Final verification
        console.log('\n3. Final verification...');
        const [hospitals] = await connection.query('SELECT COUNT(*) as count FROM hospitals');
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        const [doctors] = await connection.query('SELECT COUNT(*) as count FROM doctors');
        
        console.log('📊 Current data:');
        console.log(`   - Hospitals: ${hospitals[0].count}`);
        console.log(`   - Users: ${users[0].count}`);
        console.log(`   - Doctors: ${doctors[0].count}`);

        console.log('\n🎉 Database population completed successfully!');
        
    } catch (error) {
        console.error('❌ Database population failed:', error.message);
        console.log('\n💡 Make sure:');
        console.log('   1. XAMPP MySQL is running');
        console.log('   2. Database "mediconnect" exists');
        console.log('   3. Run "npm run setup-db" first if needed');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

populateDatabaseSimple();