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
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection function
const testConnection = async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ MySQL Database Connected Successfully');
        
        // Test query to verify database structure
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📊 Found ${tables.length} tables in database`);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
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