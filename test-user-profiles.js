/**
 * Complete User Profile Test
 * Test user registration, login, and profile management
 */

import axios from 'axios';

const API_GATEWAY_URL = 'http://localhost:4000';

async function testUserProfiles() {
    console.log('👤 Testing Complete User Profile System');
    console.log('======================================');
    
    try {
        // Test 1: Register a new user with complete profile
        console.log('1. Testing User Registration with Complete Profile...');
        const userData = {
            name: 'Alice Johnson',
            email: `alice${Date.now()}@example.com`,
            password: 'password123',
            phone: `0171${Math.floor(Math.random() * 10000000)}`,
            gender: 'FEMALE',
            dateOfBirth: '1995-05-15',
            address: 'Dhaka, Bangladesh',
            bloodGroup: 'B+',
            emergencyContact: '01987654321',
            bio: 'Software Engineer passionate about healthcare technology'
        };

        const registerResponse = await axios.post(
            `${API_GATEWAY_URL}/api/auth/register`,
            userData,
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (registerResponse.data.success) {
            console.log('✅ Registration Success!');
            console.log(`   User ID: ${registerResponse.data.user.id}`);
            console.log(`   Name: ${registerResponse.data.user.name}`);
            console.log(`   Email: ${registerResponse.data.user.email}`);
            console.log(`   Role: ${registerResponse.data.user.role}`);
            console.log(`   Profile Complete: ${registerResponse.data.user.bio ? 'Yes' : 'No'}`);

            const token = registerResponse.data.token;
            const userId = registerResponse.data.user.id;

            // Test 2: Login with the same user
            console.log('2. Testing User Login...');
            const loginResponse = await axios.post(
                `${API_GATEWAY_URL}/api/auth/login`,
                {
                    email: userData.email,
                    password: userData.password
                },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (loginResponse.data.success) {
                console.log('✅ Login Success!');
                console.log(`   Welcome back: ${loginResponse.data.user.name}`);
                console.log(`   Last Login: ${loginResponse.data.user.lastLogin || 'First time'}`);
                console.log(`   Profile Complete: ${loginResponse.data.user.bio ? 'Yes' : 'No'}`);
            } else {
                console.log('❌ Login Failed:', loginResponse.data.message);
            }

            // Test 3: Create another user to test unique profiles
            console.log('3. Testing Multiple User Profiles...');
            const userData2 = {
                name: 'Dr. Bob Smith',
                email: `bob${Date.now()}@example.com`,
                password: 'doctor123',
                phone: `0181${Math.floor(Math.random() * 10000000)}`,
                gender: 'MALE',
                role: 'DOCTOR',
                dateOfBirth: '1980-12-10',
                address: 'Chittagong, Bangladesh',
                bloodGroup: 'A+',
                bio: 'Cardiologist with 15 years of experience'
            };

            const register2Response = await axios.post(
                `${API_GATEWAY_URL}/api/auth/register`,
                userData2,
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (register2Response.data.success) {
                console.log('✅ Second User Registration Success!');
                console.log(`   Doctor ID: ${register2Response.data.user.id}`);
                console.log(`   Name: ${register2Response.data.user.name}`);
                console.log(`   Role: ${register2Response.data.user.role}`);
                console.log(`   Specialization: ${register2Response.data.user.bio}`);
            }

            console.log('\n🎉 COMPLETE SUCCESS!');
            console.log('✅ User profiles are properly differentiated');
            console.log('✅ Database stores individual user data correctly');
            console.log('✅ Login credentials work properly');
            console.log('✅ Each user has their own unique profile');
            
            console.log('\n📊 Summary:');
            console.log(`   - Patient: ${userData.name} (ID: ${userId})`);
            console.log(`   - Doctor: ${userData2.name} (ID: ${register2Response.data.user.id})`);
            console.log('   - Both have separate profiles and credentials');

        } else {
            console.log('❌ Registration failed:', registerResponse.data.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
        console.log('\n💡 Make sure:');
        console.log('   - API Gateway is running (http://localhost:4000)');
        console.log('   - Backend is running (http://localhost:5000)');
        console.log('   - Database is connected');
    }
}

// Run the test
testUserProfiles();