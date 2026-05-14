// ===============================================
// MySQL Database Connection (Direct SQL)
// Replaces Sequelize with direct MySQL queries
// ===============================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool for better performance
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'mediconnect',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    ssl: false,
    multipleStatements: false
});

// Test connection function
const testConnection = async () => {
    try {
        console.log('🔄 Testing database connection...');
        console.log(`📍 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
        console.log(`🗄️ Database: ${process.env.DB_NAME || 'mediconnect'}`);
        console.log(`👤 User: ${process.env.DB_USER || 'root'}`);
        
        const connection = await db.getConnection();
        console.log('✅ MySQL Database Connected Successfully');
        
        // Test query to verify database structure
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📊 Found ${tables.length} tables in database`);
        
        if (tables.length === 0) {
            console.warn('⚠️ Database is empty. Run database setup scripts first.');
        }
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('💡 Troubleshooting:');
        console.error('   - Make sure MySQL/XAMPP is running');
        console.error('   - Verify database credentials in .env file');
        console.error('   - Check if database "mediconnect" exists');
        console.error('   - Ensure no firewall is blocking the connection');
        return false;
    }
};

// Helper function to execute queries safely
const executeQuery = async (query, params = []) => {
    try {
        const [results] = await db.execute(query, params);
        return results;
    } catch (error) {
        console.error('Query Error:', error.message);
        throw error;
    }
};

// Helper function for SELECT queries
const selectQuery = async (query, params = []) => {
    try {
        const [rows] = await db.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Select Query Error:', error.message);
        throw error;
    }
};

// Helper function for INSERT queries
const insertQuery = async (query, params = []) => {
    try {
        const [result] = await db.execute(query, params);
        return {
            insertId: result.insertId,
            affectedRows: result.affectedRows
        };
    } catch (error) {
        console.error('Insert Query Error:', error.message);
        throw error;
    }
};

// Helper function for UPDATE queries
const updateQuery = async (query, params = []) => {
    try {
        const [result] = await db.execute(query, params);
        return {
            affectedRows: result.affectedRows,
            changedRows: result.changedRows
        };
    } catch (error) {
        console.error('Update Query Error:', error.message);
        throw error;
    }
};

module.exports = {
    db,
    testConnection,
    executeQuery,
    selectQuery,
    insertQuery,
    updateQuery
};