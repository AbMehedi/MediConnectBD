const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./models');

// Routes
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/emergency', emergencyRoutes);

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

// Sync Database and Start Server
const PORT = process.env.PORT || 5000;

// Test database connection first
sequelize.authenticate().then(() => {
    console.log('MySQL Database Connected Successfully.');
    
    // Use force: true in development to recreate tables with new schema
    // WARNING: This will drop existing data!
    const syncOptions = process.env.NODE_ENV === 'production' 
        ? { alter: false } 
        : { force: true, alter: false };
    
    return sequelize.sync(syncOptions);
}).then(() => {
    console.log('MySQL Database Synced Successfully');
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🏥 MediConnect BD Backend API Ready`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}).catch(err => {
    console.error('❌ Database connection/sync failed:', err.message);
    console.error('💡 Try restarting MySQL service or check connection settings');
    process.exit(1);
});