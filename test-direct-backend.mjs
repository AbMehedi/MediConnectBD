import http from 'http';

function testDirectBackend() {
    const testData = {
        name: "Direct Backend Test",
        email: `direct${Date.now()}@example.com`,
        password: "password123",
        phone: `019${Date.now().toString().slice(-8)}`,
        role: "PATIENT",
        dateOfBirth: "1990-01-15",
        gender: "MALE", 
        address: "Direct Backend Street, Test City",
        bloodGroup: "O+",
        emergencyContact: "01987654321",
        bio: "This is a direct backend test bio to verify data integrity"
    };

    console.log('🔧 Testing Direct Backend Registration');
    console.log('=====================================');
    console.log('📤 Sending data:', {
        name: testData.name,
        email: testData.email,
        address: testData.address,
        bio: testData.bio
    });

    const data = JSON.stringify(testData);

    const options = {
        hostname: 'localhost',
        port: 5000,  // Direct to backend
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        console.log(`📡 Response Status: ${res.statusCode}`);
        
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
            try {
                const parsed = JSON.parse(responseData);
                if (parsed.success) {
                    console.log('\\n✅ Direct backend registration successful!');
                    const user = parsed.user;
                    console.log('\\n📊 Response Data:');
                    console.log('Address:', user.address || 'undefined');
                    console.log('Bio:', user.bio || 'undefined');
                } else {
                    console.log('❌ Registration failed:', parsed.message);
                }
            } catch (e) {
                console.log('❌ Failed to parse response:', responseData);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Request error:', e.message);
    });

    req.write(data);
    req.end();
}

testDirectBackend();