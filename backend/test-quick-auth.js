/**
 * Quick Patient Auth Test
 */

const { selectQuery, insertQuery } = require('./config/database');
const { registerUser, authUser } = require('./controllers/userController_WORKING');

// Mock request and response objects
function createMockRequest(body) {
    return { body };
}

function createMockResponse() {
    const res = {
        statusCode: null,
        responseData: null,
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            this.responseData = data;
            console.log(`Response Status: ${this.statusCode}`);
            console.log('Response Data:', JSON.stringify(data, null, 2));
            return this;
        }
    };
    return res;
}

async function testRegistrationAndLogin() {
    console.log('🧪 Quick Patient Auth Test');
    console.log('==========================');
    
    try {
        // Cleanup existing test user
        await selectQuery('DELETE FROM users WHERE email = ?', ['quicktest@example.com']);
        
        // Test Registration
        console.log('\n📝 Testing Registration...');
        const regReq = createMockRequest({
            name: 'Quick Test User',
            email: 'quicktest@example.com',
            phone: '+8801999888777',
            password: 'quicktest123',
            role: 'PATIENT'
        });
        const regRes = createMockResponse();
        
        await registerUser(regReq, regRes);
        
        if (regRes.statusCode === 201 && regRes.responseData.success) {
            console.log('✅ Registration successful!');
            
            // Test Login
            console.log('\n🔐 Testing Login...');
            const loginReq = createMockRequest({
                email: 'quicktest@example.com',
                password: 'quicktest123'
            });
            const loginRes = createMockResponse();
            
            await authUser(loginReq, loginRes);
            
            if (loginRes.statusCode === 200 && loginRes.responseData.success) {
                console.log('✅ Login successful!');
                console.log('\n🎉 Both registration and login work perfectly!');
            } else {
                console.log('❌ Login failed');
            }
        } else {
            console.log('❌ Registration failed');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testRegistrationAndLogin();