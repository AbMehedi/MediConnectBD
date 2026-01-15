import http from 'http';

function testFullStackRegistration() {
    const testData = {
        name: "Full Stack Test User",
        email: `fullstack${Date.now()}@example.com`,
        password: "password123",
        phone: `017${Date.now().toString().slice(-8)}`,  // Unique phone
        role: "PATIENT",
        dateOfBirth: "1990-01-15",
        gender: "MALE",
        address: "456 Full Stack Street, Dhaka",
        bloodGroup: "O+",
        emergencyContact: "01987654321",
        bio: "This is my complete bio with full stack test"
    };

    const data = JSON.stringify(testData);

    console.log('🧪 Testing Full Stack Registration');
    console.log('==================================');
    console.log('📝 Test data:');
    console.log({
        name: testData.name,
        email: testData.email,
        phone: testData.phone,
        address: testData.address,
        bio: testData.bio
    });

    const options = {
        hostname: 'localhost',
        port: 4000,  // API Gateway
        path: '/api/auth/register',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        console.log(`\\n📡 Response Status: ${res.statusCode}`);
        
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            try {
                const parsed = JSON.parse(responseData);
                if (parsed.success && parsed.user) {
                    console.log('\\n✅ Registration successful through API Gateway!');
                    console.log('\\n📊 User Profile Data:');
                    const user = parsed.user;
                    console.log('ID:', user.id);
                    console.log('Name:', user.name);
                    console.log('Email:', user.email);
                    console.log('Phone:', user.phone);
                    console.log('Address:', user.address);
                    console.log('Bio:', user.bio);

                    // Data integrity check
                    console.log('\\n🔍 Data Integrity Check:');
                    console.log('Expected Email:', testData.email);
                    console.log('Actual Email  :', user.email);
                    console.log('Email Match   :', testData.email === user.email ? '✅' : '❌');

                    console.log('Expected Bio  :', testData.bio);
                    console.log('Actual Bio    :', user.bio);
                    console.log('Bio Match     :', testData.bio === user.bio ? '✅' : '❌');

                    if (testData.email === user.email && testData.bio === user.bio) {
                        console.log('\\n🎉 ALL DATA INTEGRITY CHECKS PASSED!');
                    } else {
                        console.log('\\n❌ DATA CORRUPTION DETECTED!');
                    }
                } else {
                    console.log('❌ Registration failed:', parsed.message);
                }
            } catch (e) {
                console.log('❌ Failed to parse response:', e.message);
                console.log('Raw response:', responseData);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Request error:', e.message);
    });

    req.write(data);
    req.end();
}

testFullStackRegistration();