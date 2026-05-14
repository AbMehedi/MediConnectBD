const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { testConnection } = require('./config/database');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const testRoutes = require('./routes/testRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/test', testRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'MediConnect BD Backend API is running',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// Socket.io
const io = new Server(server, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    console.log('Client Connected:', socket.id);

    socket.on('join_queue', (doctorId) => {
        socket.join(`queue_${doctorId}`);
    });

    socket.on('update_queue', (data) => {
        io.to(`queue_${data.doctorId}`).emit('queue_updated', data);
    });

    socket.on('disconnect', () => {
        console.log('Client Disconnected');
    });
});

// Test database connection and start server
const PORT = process.env.PORT || 5000;

testConnection().then((connected) => {
    if (!connected) {
        console.error('❌ Database connection failed. Exiting...');
        process.exit(1);
    }
    
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🏥 MediConnect BD Backend API Ready`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
        console.log(`✅ Database: Connected with direct SQL queries`);
    });
}).catch(err => {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
});