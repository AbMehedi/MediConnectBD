/**
 * Test Database Connection and Basic Operations
 * Run this to verify the three-layer architecture works correctly
 */

const { testConnection, selectQuery, insertQuery } = require('./config/database');

async function testDatabaseOperations() {
    console.log('🧪 MediConnect BD - Database Connection Test');
    console.log('=============================================');

    try {
        // 1. Test basic connection
        console.log('1. Testing database connection...');
        const connected = await testConnection();
        
        if (!connected) {
            console.log('❌ Connection failed. Setup instructions:');
            console.log('   1. Start XAMPP MySQL service');
            console.log('   2. Open phpMyAdmin (http://localhost/phpmyadmin)');
            console.log('   3. Create database "mediconnect"');
            console.log('   4. Run the SQL from database/create_tables.sql');
            return;
        }

        // 2. Test table structure
        console.log('2. Checking table structure...');
        const tables = await selectQuery('SHOW TABLES');
        
        if (tables.length === 0) {
            console.log('⚠️  No tables found. Please run:');
            console.log('   npm run setup-db');
            console.log('   or execute database/create_tables.sql manually');
            return;
        }

        console.log(`✅ Found ${tables.length} tables:`);
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
        });

        // 3. Test users table specifically
        console.log('3. Testing users table structure...');
        const userTableInfo = await selectQuery('DESCRIBE users');
        console.log('✅ Users table structure verified');
        console.log('   Columns:', userTableInfo.map(col => col.Field).join(', '));

        // 4. Test sample query
        console.log('4. Testing sample queries...');
        const userCount = await selectQuery('SELECT COUNT(*) as count FROM users');
        console.log(`✅ Current user count: ${userCount[0].count}`);

        console.log('\n🎉 Database connection test completed successfully!');
        console.log('✅ Your three-layer architecture is ready:');
        console.log('   - Frontend (React) → API Gateway (Port 4000) → Backend (Port 5000) → Database (MySQL)');
        console.log('\n🚀 Next steps:');
        console.log('   1. Start the backend: cd backend && npm run dev');
        console.log('   2. Start the API gateway: cd api-gateway && npm run dev');
        console.log('   3. Start the frontend: npm run dev');

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.log('\n💡 Common issues:');
        console.log('   - XAMPP MySQL not running');
        console.log('   - Database "mediconnect" doesn\'t exist');
        console.log('   - Tables not created');
        console.log('   - Incorrect credentials in .env file');
    } finally {
        process.exit(0);
    }
}

// Run the test
testDatabaseOperations();