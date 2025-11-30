const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { sequelize } = require('./models');

// Routes
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const assistantRoutes = require('./routes/assistantRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/assistants', assistantRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'MediConnect BD Backend API (Stable)',
        timestamp: new Date().toISOString(),
        version: '3.0.0'
    });
});

// Test assistant endpoints
app.get('/api/test/assistant', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Assistant endpoints ready',
        endpoints: {
            'register': 'POST /api/assistants/register',
            'get_assistants': 'GET /api/assistants/doctor/:doctorId',
            'update_permissions': 'PUT /api/assistants/:assistantId',
            'test_data': 'POST /api/assistants/test-data'
        }
    });
});

const PORT = 4000; // Forcing a known stable port

// Database connection and server start
sequelize.authenticate()
    .then(() => {
        console.log('✅ Database connected');
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Stable server running on http://localhost:${PORT}`);
            console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
            console.log(`🧪 Assistant Test: http://localhost:${PORT}/api/test/assistant`);
            console.log(`📋 Running pure Express - Socket.IO can be added later.`);
        });
    })
    .catch(err => {
        console.error('❌ Database error:', err.message);
        process.exit(1);
    });