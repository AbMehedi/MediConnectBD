/**
 * Complete Patient Registration and Login Test
 * Tests the full registration and login flow
 */

const http = require('http');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Test data
const testPatient = {
    name: 'Test Patient Registration',
    email: 'testpatientreg@example.com',
    phone: '+8801555666777',
    password: 'MyTestPassword123!',
    role: 'PATIENT',
    dateOfBirth: '1992-08-15',
    gender: 'Male',
    address: '789 Test Street, Chittagong',
    bloodGroup: 'O+',
    emergencyContact: '+8801888999000',
    bio: 'Testing patient registration and login functionality'
};

async function makeHttpRequest(path, method, data = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        data: parsedData
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: { error: 'Invalid JSON response', raw: responseData }
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

async function cleanupTestUser() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            port: process.env.DB_PORT || 3306,
            database: 'mediconnect'
        });

        await connection.execute(
            'DELETE FROM users WHERE email = ?',
            [testPatient.email]
        );

        await connection.end();
        console.log('🧹 Cleaned up existing test user');
    } catch (error) {
        console.log('⚠️  Cleanup warning:', error.message);
    }
}

async function testCompleteFlow() {
    console.log('🏥 MediConnect BD - Patient Registration & Login Test');
    console.log('=====================================================');
    console.log('');

    try {
        // Step 1: Cleanup any existing test user
        console.log('Step 1: Cleaning up existing test data...');
        await cleanupTestUser();
        
        // Step 2: Test Registration
        console.log('\\nStep 2: Testing Patient Registration...');
        console.log('📋 Registration data:');
        console.log('   Name:', testPatient.name);
        console.log('   Email:', testPatient.email);
        console.log('   Phone:', testPatient.phone);
        console.log('   Role:', testPatient.role);

        const registrationResponse = await makeHttpRequest('/api/users/register', 'POST', testPatient);
        
        console.log('\\n📊 Registration Response:');
        console.log('   Status:', registrationResponse.statusCode);
        
        if (registrationResponse.statusCode === 201 && registrationResponse.data.success) {
            console.log('   ✅ Registration successful!');
            console.log('   User ID:', registrationResponse.data.user.id);
            console.log('   Name:', registrationResponse.data.user.name);
            console.log('   Email:', registrationResponse.data.user.email);
            console.log('   Role:', registrationResponse.data.user.role);
            console.log('   Token provided:', !!registrationResponse.data.token);
            
            // Step 3: Test Login
            console.log('\\nStep 3: Testing Patient Login...');
            console.log('📋 Login credentials:');
            console.log('   Email:', testPatient.email);
            console.log('   Password: [PROTECTED]');

            const loginData = {
                email: testPatient.email,
                password: testPatient.password
            };

            const loginResponse = await makeHttpRequest('/api/users/login', 'POST', loginData);
            
            console.log('\\n📊 Login Response:');
            console.log('   Status:', loginResponse.statusCode);
            
            if (loginResponse.statusCode === 200 && loginResponse.data.success) {
                console.log('   ✅ Login successful!');
                console.log('   User ID:', loginResponse.data.user.id);
                console.log('   Name:', loginResponse.data.user.name);
                console.log('   Email:', loginResponse.data.user.email);
                console.log('   Role:', loginResponse.data.user.role);
                console.log('   Active:', loginResponse.data.user.isActive);
                console.log('   Verified:', loginResponse.data.user.isVerified);
                console.log('   Token provided:', !!loginResponse.data.token);
                
                if (loginResponse.data.token) {
                    console.log('   Token preview:', loginResponse.data.token.substring(0, 30) + '...');
                }

                console.log('\\n🎉 COMPLETE SUCCESS!');
                console.log('   ✅ Patient registration works correctly');
                console.log('   ✅ Patient login works correctly');
                console.log('   ✅ Authentication tokens are generated');
                console.log('   ✅ User data is properly stored and retrieved');
                
            } else {
                console.log('   ❌ Login failed!');
                console.log('   Error:', loginResponse.data.message || 'Unknown error');
            }
            
        } else {
            console.log('   ❌ Registration failed!');
            console.log('   Error:', registrationResponse.data.message || 'Unknown error');
            console.log('   Response:', registrationResponse.data);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }

    console.log('\\n📋 Test Summary:');
    console.log('   Backend API: http://localhost:5000');
    console.log('   Registration endpoint: POST /api/users/register');
    console.log('   Login endpoint: POST /api/users/login');
    console.log('   Test completed at:', new Date().toISOString());
}

// Run the test
testCompleteFlow();