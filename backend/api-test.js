const http = require('http');

const PORT = 4000;

function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    // Not JSON, return as is
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (err) => {
            reject(new Error(`Request failed: ${err.message}`));
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function runApiTests() {
    console.log('🧪 Starting API tests...');
    let doctor, assistant;

    try {
        // 1. Health Check
        console.log('\n1. Testing Health Endpoint...');
        const healthCheck = await makeRequest({ hostname: 'localhost', port: PORT, path: '/api/health', method: 'GET' });
        if (healthCheck.status !== 200) throw new Error(`Health check failed with status ${healthCheck.status}`);
        console.log(`✅ Health check successful: ${healthCheck.data.message} (Version: ${healthCheck.data.version})`);

        // 2. Create Test Data
        console.log('\n2. Creating Test Data (Doctor and Assistant users)...');
        const testDataResult = await makeRequest({
            hostname: 'localhost',
            port: PORT,
            path: '/api/assistants/test-data',
            method: 'POST'
        });
        if (testDataResult.status !== 201) throw new Error(`Test data creation failed with status ${testDataResult.status}`);
        doctor = testDataResult.data.doctor;
        assistant = testDataResult.data.assistant;
        console.log(`✅ Test data created. Doctor ID: ${doctor.doctorId}, Assistant User ID: ${assistant.userId}`);

        // 3. Register Assistant
        console.log('\n3. Registering Assistant to Doctor...');
        const registrationPayload = JSON.stringify({
            userId: assistant.userId,
            doctorId: doctor.doctorId,
            permissions: ["view", "schedule", "communicate"],
            delegationLevel: 'ADVANCED',
            notes: 'Test registration'
        });
        const registrationResult = await makeRequest({
            hostname: 'localhost',
            port: PORT,
            path: '/api/assistants/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': registrationPayload.length }
        }, registrationPayload);
        if (registrationResult.status !== 201) throw new Error(`Assistant registration failed with status ${registrationResult.status}`);
        console.log(`✅ Assistant registered successfully.`);

        // 4. Get Doctor's Assistants
        console.log(`\n4. Fetching Assistants for Doctor ID ${doctor.doctorId}...`);
        const getAssistantsResult = await makeRequest({
            hostname: 'localhost',
            port: PORT,
            path: `/api/assistants/doctor/${doctor.doctorId}`,
            method: 'GET'
        });
        if (getAssistantsResult.status !== 200) throw new Error(`Fetching assistants failed with status ${getAssistantsResult.status}`);
        if (getAssistantsResult.data.assistants.length === 0) throw new Error('No assistants found after registration.');
        console.log(`✅ Found ${getAssistantsResult.data.assistants.length} assistant(s).`);
        console.log(`   - Assistant Name: ${getAssistantsResult.data.assistants[0].User.name}`);
        console.log(`   - Delegation Level: ${getAssistantsResult.data.assistants[0].delegationLevel}`);

        console.log('\n\n🎉 All API tests passed successfully!');
        console.log('✅ Backend is stable and fully functional.');

    } catch (error) {
        console.error('\n\n❌ API Test Failed!');
        console.error(error.message);
        process.exit(1);
    }
}

// Wait for server to be ready
setTimeout(runApiTests, 3000);
