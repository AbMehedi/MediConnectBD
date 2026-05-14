/**
 * Manual Database Population with Fixed Queries
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function populateManually() {
    console.log('🏥 MediConnect BD - Manual Population');
    console.log('====================================');

    let connection;
    
    try {
        // Connect to database
        console.log('1. Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            port: process.env.DB_PORT || 3306,
            database: 'mediconnect'
        });
        console.log('✅ Connected to mediconnect database');

        console.log('2. Inserting sample hospitals...');
        
        // Insert hospitals
        const hospitalQuery = `
        INSERT INTO hospitals (
            name, address, district, division, type, category, registrationNumber, email, contact, 
            emergencyContact, website, totalBeds, generalBeds, generalBedsAvailable, icuBeds, 
            icuAvailable, ccuBeds, ccuAvailable, services, departments, specializations,
            emergencyServices, ambulanceServices, bloodBank, isActive, isVerified, rating, 
            totalRatings, establishedYear, description, createdAt, updatedAt
        ) VALUES 
        (
            'Dhaka Medical College Hospital', 'Ramna, Dhaka 1000, Bangladesh', 'Dhaka', 'Dhaka',
            'Public', 'Tertiary', 'REG001', 'info@dmch.gov.bd', '+8802-9661177', 
            '+8802-9661177', 'http://www.dmch.gov.bd', 2000, 1800, 150, 50, 20, 25, 10,
            '["General Medicine", "Surgery", "Emergency", "Maternity"]',
            '["Cardiology", "Neurology", "Orthopedics", "Pediatrics"]',
            '["Cardiology", "Neurology", "Orthopedics", "General Surgery"]',
            1, 1, 1, 1, 1, 4.2, 156, 1946, 
            'Leading government medical college hospital in Bangladesh', NOW(), NOW()
        ),
        (
            'Square Hospital', '18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka 1205', 'Dhaka', 'Dhaka',
            'Private', 'Tertiary', 'REG002', 'info@squarehospital.com.bd', '+8802-8144400', 
            '+8802-8144401', 'https://squarehospital.com', 650, 500, 80, 25, 15, 20, 12,
            '["General Medicine", "Surgery", "Emergency", "Oncology"]',
            '["Cardiology", "Oncology", "Neurosurgery", "Pediatrics"]',
            '["Cardiology", "Oncology", "Neurosurgery", "Pediatrics"]',
            1, 1, 1, 1, 1, 4.5, 245, 2006, 
            'Premium private hospital with international standards', NOW(), NOW()
        )`;

        await connection.execute(hospitalQuery);
        console.log('✅ Hospitals inserted');

        console.log('3. Inserting sample users...');
        
        // Insert users
        const userQuery = `
        INSERT INTO users (name, email, phone, password, role, isVerified, createdAt, updatedAt) 
        VALUES 
        ('John Patient', 'john.patient@email.com', '+8801712345678', '$2b$10$dummyhashedpassword', 'patient', 1, NOW(), NOW()),
        ('Dr. Ahmed Hassan', 'ahmed.hassan@doctor.com', '+8801712345679', '$2b$10$dummyhashedpassword', 'doctor', 1, NOW(), NOW()),
        ('Dr. Sarah Khan', 'sarah.khan@doctor.com', '+8801712345680', '$2b$10$dummyhashedpassword', 'doctor', 1, NOW(), NOW())`;

        await connection.execute(userQuery);
        console.log('✅ Users inserted');

        console.log('4. Inserting sample doctors...');
        
        // Insert doctors
        const doctorQuery = `
        INSERT INTO doctors (
            userId, specialization, bmdcNumber, experienceYears, hospitalId, hospitalName,
            department, designation, feesOnline, feesPhysical, education, qualifications,
            about, schedule, roomNumber, languages, maxPatientsPerDay, consultationDuration,
            telemedicineDuration, available, isTelemedicineEnabled, isVerified, rating,
            totalRatings, totalPatients, currentLoad, status, createdAt, updatedAt
        ) VALUES 
        (
            2, 'Cardiology', 'BMDC12345', 5, 1, 'Dhaka Medical College Hospital',
            'Cardiology', 'Assistant Professor', 500.00, 800.00,
            JSON_ARRAY('MBBS', 'MD (Cardiology)'), 'MBBS from DMC, MD in Cardiology from BSMMU',
            'Experienced cardiologist specializing in heart diseases',
            JSON_OBJECT('monday', '9:00-17:00', 'tuesday', '9:00-17:00', 'wednesday', '9:00-17:00'),
            'Room 201', JSON_ARRAY('Bengali', 'English'), 20, 15, 10, 1, 1, 1, 4.5, 25, 150, 5,
            'Active', NOW(), NOW()
        ),
        (
            3, 'Neurology', 'BMDC54321', 8, 2, 'Square Hospital',
            'Neurology', 'Senior Consultant', 600.00, 1000.00,
            JSON_ARRAY('MBBS', 'FCPS (Neurology)'), 'MBBS from CMC, FCPS in Neurology',
            'Expert neurologist with focus on stroke and epilepsy',
            JSON_OBJECT('sunday', '10:00-16:00', 'tuesday', '10:00-16:00', 'thursday', '10:00-16:00'),
            'Room 305', JSON_ARRAY('Bengali', 'English', 'Hindi'), 15, 20, 15, 1, 1, 1, 4.7, 42, 280, 3,
            'Active', NOW(), NOW()
        )`;

        await connection.execute(doctorQuery);
        console.log('✅ Doctors inserted');

        // Final verification
        console.log('\n5. Final verification...');
        const [hospitals] = await connection.query('SELECT COUNT(*) as count FROM hospitals');
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        const [doctors] = await connection.query('SELECT COUNT(*) as count FROM doctors');
        
        console.log('📊 Current data:');
        console.log(`   - Hospitals: ${hospitals[0].count}`);
        console.log(`   - Users: ${users[0].count}`);
        console.log(`   - Doctors: ${doctors[0].count}`);

        console.log('\n🎉 Database population completed successfully!');
        console.log('🚀 Your application now has sample data for testing');

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('⚠️  Some data already exists - this is normal if running multiple times');
        } else {
            console.error('❌ Database population failed:', error.message);
            console.log('\n💡 Make sure:');
            console.log('   1. XAMPP MySQL is running');
            console.log('   2. Database "mediconnect" exists');
            console.log('   3. Tables are created (run: npm run setup-db)');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

populateManually();