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

sequelize.sync({ alter: true }).then(() => {
    console.log('MySQL Database Synced');
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});