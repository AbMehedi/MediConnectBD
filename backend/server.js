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
const PORT = 5001; // Use a fixed port to avoid conflicts

// Function to start the server
const startServer = () => {
    // Test database connection first
    sequelize.authenticate()
        .then(() => {
            console.log('✅ Database connection successful. Schema is managed by migrations.');
            
            // Start the server
            return new Promise((resolve, reject) => {
                const httpServer = server.listen(PORT, '0.0.0.0', () => {
                    console.log(`\n🚀 Server running on port ${PORT}`);
                    console.log(`🏥 MediConnect BD Backend API Ready`);
                    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}\n`);
                    resolve(httpServer);
                }).on('error', (err) => {
                    if (err.code === 'EADDRINUSE') {
                        console.error(`❌ Port ${PORT} is already in use.`);
                        console.log('💡 Trying to find and close the process...');
                        // Try to find and kill the process using the port
                        const { exec } = require('child_process');
                        exec(`netstat -ano | findstr :${PORT}`, (error, stdout) => {
                            if (stdout) {
                                const processId = stdout.trim().split(/\s+/).pop();
                                if (processId) {
                                    console.log(`🛑 Killing process with PID: ${processId}`);
                                    exec(`taskkill /F /PID ${processId}`, () => {
                                        console.log('✅ Process terminated. Please restart the server.');
                                    });
                                }
                            }
                        });
                    }
                    reject(err);
                });
            });
        })
        .catch(err => {
            console.error('❌ Error during database connection/sync:', err.message);
            if (err.original) {
                console.error('💡 Database error details:', err.original);
            }
            console.log('\n🔧 Troubleshooting steps:');
            console.log('1. Make sure MySQL server is running');
            console.log('2. Check your database credentials in config/config.json');
            console.log('3. Try running: npx sequelize-cli db:drop && npx sequelize-cli db:create && npx sequelize-cli db:migrate\n');
            process.exit(1);
        });
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});