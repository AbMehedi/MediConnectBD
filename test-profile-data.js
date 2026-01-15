import axios from 'axios';

async function testProfileData() {
    try {
        console.log('🧪 Testing Profile Data Issues');
        console.log('================================');

        // Test registration with detailed data
        const registrationData = {
            name: "Test Profile User",
            email: `profile${Date.now()}@example.com`,
            password: "password123",
            phone: "01234567890",
            role: "PATIENT",
            dateOfBirth: "1990-01-15",
            gender: "MALE",
            address: "123 Main Street, Dhaka",
            bloodGroup: "O+",
            emergencyContact: "01987654321",
            bio: "This is a test user bio"
        };

        console.log('📝 Registering user with data:');
        console.log({
            name: registrationData.name,
            email: registrationData.email,
            phone: registrationData.phone,
            address: registrationData.address,
            bio: registrationData.bio
        });

        const registerResponse = await axios.post('http://localhost:4000/api/auth/register', registrationData);
        console.log('✅ Registration successful:', registerResponse.data.message);
        
        const userId = registerResponse.data.user.id;
        console.log('👤 User ID:', userId);

        // Login to get token
        const loginResponse = await axios.post('http://localhost:4000/api/auth/login', {
            email: registrationData.email,
            password: registrationData.password
        });

        const token = loginResponse.data.token;
        console.log('🔐 Login successful, got token');

        // Get profile data
        const profileResponse = await axios.get('http://localhost:4000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('\n📊 Profile Data Retrieved:');
        const profile = profileResponse.data.user;
        console.log({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            address: profile.address,
            bio: profile.bio,
            bloodGroup: profile.bloodGroup,
            emergencyContact: profile.emergencyContact
        });

        // Check for data issues
        console.log('\n🔍 Data Integrity Check:');
        console.log('Expected Email:', registrationData.email);
        console.log('Actual Email  :', profile.email);
        console.log('Match:', registrationData.email === profile.email ? '✅' : '❌');

        console.log('Expected Phone:', registrationData.phone);
        console.log('Actual Phone  :', profile.phone);
        console.log('Match:', registrationData.phone === profile.phone ? '✅' : '❌');

        console.log('Expected Bio:', registrationData.bio);
        console.log('Actual Bio  :', profile.bio);
        console.log('Match:', registrationData.bio === profile.bio ? '✅' : '❌');

        // Test direct database query
        console.log('\n🗄️ Direct Database Check:');
        const directCheck = await axios.get(`http://localhost:4000/api/test/user/${userId}`);
        if (directCheck.data) {
            console.log('Direct DB data:', {
                email: directCheck.data.email,
                phone: directCheck.data.phone,
                bio: directCheck.data.bio
            });
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testProfileData();