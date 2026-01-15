const http = require('http');

function testDirectRegistration() {
    const data = JSON.stringify({
        name: "Data Test User",
        email: `datatest${Date.now()}@example.com`,
        password: "password123",
        phone: "01234567890",
        role: "PATIENT",
        dateOfBirth: "1990-01-15",
        gender: "MALE",
        address: "123 Test Street, Dhaka",
        bloodGroup: "O+",
        emergencyContact: "01987654321",
        bio: "This is my test bio content"
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            console.log('Response:', responseData);
            try {
                const parsed = JSON.parse(responseData);
                if (parsed.success && parsed.user) {
                    console.log('\n✅ Registration successful!');
                    console.log('User ID:', parsed.user.id);
                    console.log('Name:', parsed.user.name);
                    console.log('Email:', parsed.user.email);
                    console.log('Phone:', parsed.user.phone);
                    console.log('Bio:', parsed.user.bio);
                    console.log('Address:', parsed.user.address);
                } else {
                    console.log('❌ Registration failed:', parsed.message);
                }
            } catch (e) {
                console.log('❌ Failed to parse response:', e.message);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Request error:', e.message);
    });

    req.write(data);
    req.end();
}

testDirectRegistration();