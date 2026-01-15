import http from 'http';

async function testDataIntegrityFixes() {
    console.log('🔧 Testing Data Integrity Fixes');
    console.log('================================');
    
    const timestamp = Date.now();
    const testUsers = [
        {
            name: "Alice Complete Profile",
            email: `alice${timestamp}@example.com`,
            password: "password123",
            phone: `017${timestamp.toString().slice(-8)}`,
            role: "PATIENT",
            dateOfBirth: "1992-03-15",
            gender: "FEMALE",
            address: "123 Alice Street, Dhaka, Bangladesh",
            bloodGroup: "A+",
            emergencyContact: "01987654321",
            bio: "I am Alice, a software engineer who loves technology and healthcare innovation."
        },
        {
            name: "Dr. Bob Medical",
            email: `bob${timestamp + 1}@example.com`,
            password: "password123", 
            phone: `018${(timestamp + 1).toString().slice(-8)}`,
            role: "DOCTOR",
            dateOfBirth: "1985-07-20",
            gender: "MALE",
            address: "456 Medical Center Road, Chittagong",
            bloodGroup: "B+",
            emergencyContact: "01776543210",
            bio: "Dr. Bob is an experienced cardiologist with 15 years of practice in Bangladesh."
        }
    ];

    for (let i = 0; i < testUsers.length; i++) {
        const userData = testUsers[i];
        console.log(`\\n👤 Testing User ${i + 1}: ${userData.name}`);
        console.log('━'.repeat(50));
        
        try {
            // Test Registration
            const registrationResult = await makeRequest('POST', 4000, '/api/auth/register', userData);
            
            if (registrationResult.success) {
                console.log('✅ Registration successful');
                const user = registrationResult.user;
                
                // Verify all fields
                console.log('\\n📊 Profile Data Verification:');
                console.log(`ID: ${user.id}`);
                console.log(`Name: ${user.name}`);
                console.log(`Email: ${user.email} ${user.email === userData.email ? '✅' : '❌'}`);
                console.log(`Phone: ${user.phone} ${user.phone === userData.phone ? '✅' : '❌'}`);
                console.log(`Address: ${user.address || 'undefined'} ${user.address === userData.address ? '✅' : '❌'}`);
                console.log(`Bio: ${user.bio || 'undefined'} ${user.bio === userData.bio ? '✅' : '❌'}`);
                console.log(`Role: ${user.role} ${user.role === userData.role ? '✅' : '❌'}`);
                console.log(`Profile Complete: ${user.profileComplete ? 'Yes' : 'No'}`);
                
                // Test Login
                console.log('\\n🔐 Testing Login...');
                const loginResult = await makeRequest('POST', 4000, '/api/auth/login', {
                    email: userData.email,
                    password: userData.password
                });
                
                if (loginResult.success) {
                    console.log('✅ Login successful');
                    
                    // Test Profile Retrieval
                    console.log('\\n📋 Testing Profile Retrieval...');
                    const profileResult = await makeRequest('GET', 4000, '/api/auth/profile', null, {
                        'Authorization': `Bearer ${loginResult.token}`
                    });
                    
                    if (profileResult.success) {
                        console.log('✅ Profile retrieval successful');
                        const profile = profileResult.user;
                        
                        console.log('\\n🔍 Retrieved Profile Data:');
                        console.log(`Address: ${profile.address || 'undefined'} ${profile.address === userData.address ? '✅' : '❌'}`);
                        console.log(`Bio: ${profile.bio || 'undefined'} ${profile.bio === userData.bio ? '✅' : '❌'}`);
                        
                        // Final Assessment
                        const isDataPerfect = (
                            profile.email === userData.email &&
                            profile.phone === userData.phone &&
                            profile.address === userData.address &&
                            profile.bio === userData.bio
                        );
                        
                        if (isDataPerfect) {
                            console.log('\\n🎉 DATA INTEGRITY: PERFECT ✅');
                        } else {
                            console.log('\\n❌ DATA INTEGRITY: ISSUES DETECTED');
                        }
                        
                    } else {
                        console.log('❌ Profile retrieval failed:', profileResult.message);
                    }
                } else {
                    console.log('❌ Login failed:', loginResult.message);
                }
                
            } else {
                console.log('❌ Registration failed:', registrationResult.message);
            }
            
        } catch (error) {
            console.log('❌ Test failed:', error.message);
        }
    }
    
    console.log('\\n' + '='.repeat(50));
    console.log('🏁 DATA INTEGRITY TESTING COMPLETE');
    console.log('='.repeat(50));
}

function makeRequest(method, port, path, data, headers = {}) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: 'localhost',
            port: port,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
                ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve(parsed);
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${responseData}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (postData) req.write(postData);
        req.end();
    });
}

testDataIntegrityFixes();