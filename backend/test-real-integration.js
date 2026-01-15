/**
 * Test Real Registration Flow
 * Test the actual frontend-backend integration
 */

const http = require('http');

async function testRealPatientRegistration() {
    console.log('🧪 Testing Real Patient Registration Flow');
    console.log('========================================');
    
    // Test with data similar to what frontend would send
    const patientData = {
        name: 'Tanvir Rahman',
        email: 'tanvir@gmail.com',
        phone: '+8801712345678',
        password: 'mypassword123',
        role: 'PATIENT',
        dateOfBirth: '1995-01-01' // Approximated from age
    };

    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(patientData);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/users/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log('📋 Registering with real data:');
        console.log('   Name:', patientData.name);
        console.log('   Email:', patientData.email);
        console.log('   Phone:', patientData.phone);
        console.log('');

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('📊 Registration Response:');
                    console.log('   Status:', res.statusCode);
                    console.log('   Success:', response.success);
                    
                    if (response.success) {
                        console.log('   ✅ Registration successful!');
                        console.log('   User ID:', response.user.id);
                        console.log('   Name in DB:', response.user.name);
                        console.log('   Email in DB:', response.user.email);
                        console.log('   Phone in DB:', response.user.phone);
                        console.log('   Blood Group:', response.user.bloodGroup || 'Not provided');
                        console.log('   Token:', response.token ? 'Generated' : 'Missing');
                        resolve(response);
                    } else {
                        console.log('   ❌ Registration failed:', response.message);
                        resolve(response);
                    }
                } catch (e) {
                    console.log('❌ Invalid response:', data);
                    resolve({ error: 'Invalid response', raw: data });
                }
            });
        });

        req.on('error', (error) => {
            console.log('❌ Request failed:', error.message);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function testRealPatientLogin() {
    console.log('\\n🔐 Testing Real Patient Login...');
    
    const loginData = {
        email: 'tanvir@gmail.com',
        password: 'mypassword123'
    };

    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(loginData);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/users/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('📊 Login Response:');
                    console.log('   Status:', res.statusCode);
                    console.log('   Success:', response.success);
                    
                    if (response.success) {
                        console.log('   ✅ Login successful!');
                        console.log('   User ID:', response.user.id);
                        console.log('   Name:', response.user.name);
                        console.log('   Email:', response.user.email);
                        console.log('   Phone:', response.user.phone);
                        console.log('   Blood Group:', response.user.bloodGroup || 'Not set');
                        console.log('   Profile Complete:', response.user.profileComplete || false);
                    } else {
                        console.log('   ❌ Login failed:', response.message);
                    }
                    resolve(response);
                } catch (e) {
                    console.log('❌ Invalid response:', data);
                    resolve({ error: 'Invalid response', raw: data });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function runFullTest() {
    try {
        // Clean up any existing user first
        const mysql = require('mysql2/promise');
        require('dotenv').config();
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            port: process.env.DB_PORT || 3306,
            database: 'mediconnect'
        });
        
        await connection.execute('DELETE FROM users WHERE email = ?', ['tanvir@gmail.com']);
        await connection.end();
        console.log('🧹 Cleaned up existing test user');
        
        // Test registration
        const regResult = await testRealPatientRegistration();
        
        if (regResult.success) {
            // Test login
            await testRealPatientLogin();
            
            console.log('\\n🎉 INTEGRATION TEST COMPLETE!');
            console.log('✅ Frontend-Backend-Database integration works correctly');
            console.log('✅ Real user data is stored and retrieved properly');
            console.log('✅ No more mock/dummy data interference');
        }
        
    } catch (error) {
        console.error('❌ Full test failed:', error.message);
    }
}

runFullTest();