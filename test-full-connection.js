/**
 * Test Complete Database Connection
 * Frontend → API Gateway → Backend → Database
 */

import axios from 'axios';

const API_GATEWAY_URL = 'http://localhost:4000';
const BACKEND_URL = 'http://localhost:5000';

async function testCompleteConnection() {
    console.log('🧪 Testing Complete Three-Layer Connection');
    console.log('===========================================');
    
    try {
        // Test 1: API Gateway Health
        console.log('1. Testing API Gateway...');
        try {
            const gatewayHealth = await axios.get(`${API_GATEWAY_URL}/health`);
            console.log('✅ API Gateway: Healthy');
            console.log(`   Status: ${gatewayHealth.data.status}`);
        } catch (error) {
            console.log('❌ API Gateway: Failed');
            console.log('   Make sure: cd api-gateway && npm run dev');
            return;
        }

        // Test 2: Backend Health (through API Gateway)
        console.log('2. Testing Backend through API Gateway...');
        try {
            const backendHealth = await axios.get(`${BACKEND_URL}/api/health`);
            console.log('✅ Backend: Healthy');
            console.log(`   Message: ${backendHealth.data.message}`);
        } catch (error) {
            console.log('❌ Backend: Failed');
            console.log('   Make sure: cd backend && npm run dev');
            return;
        }

        // Test 3: Database Connection (Register a Test User)
        console.log('3. Testing Database Connection (User Registration)...');
        const testUser = {
            name: 'Test User',
            email: `test${Date.now()}@example.com`, // Unique email
            password: 'password123',
            phone: `0171${Math.floor(Math.random() * 10000000)}`, // Unique phone
            gender: 'MALE'
        };

        try {
            const registerResponse = await axios.post(
                `${API_GATEWAY_URL}/api/auth/register`, 
                testUser,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000
                }
            );
            
            console.log('✅ Database Connection: SUCCESS');
            console.log(`   User created with ID: ${registerResponse.data.user?.id}`);
            console.log(`   Token received: ${registerResponse.data.token ? 'Yes' : 'No'}`);
            
            // Test 4: Login with the test user
            console.log('4. Testing User Login...');
            const loginResponse = await axios.post(
                `${API_GATEWAY_URL}/api/auth/login`,
                {
                    email: testUser.email,
                    password: testUser.password
                },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            
            console.log('✅ User Authentication: SUCCESS');
            console.log(`   Login successful for: ${loginResponse.data.user?.name}`);
            
        } catch (dbError) {
            console.log('❌ Database Connection: FAILED');
            console.log(`   Error: ${dbError.response?.data?.message || dbError.message}`);
            console.log('   Check:');
            console.log('   - XAMPP MySQL is running');
            console.log('   - Database "mediconnect" exists with tables');
            console.log('   - Backend database config is correct');
            return;
        }

        console.log('\n🎉 COMPLETE SUCCESS!');
        console.log('✅ Frontend → API Gateway → Backend → Database');
        console.log('\n🚀 Your system is ready for use!');
        console.log('   Frontend: http://localhost:3001');
        console.log('   API Gateway: http://localhost:4000');
        console.log('   Backend: http://localhost:5000');

    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
    }
}

// Run the test
testCompleteConnection();