require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config/config');

// Import middleware
const { detectPlatform, requestLogger, errorHandler } = require('./middleware/common');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth.routes');
const aiRoutes = require('./routes/ai.routes');
const patientRoutes = require('./routes/patient.routes');
const doctorRoutes = require('./routes/doctor.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const adminRoutes = require('./routes/admin.routes');

// Initialize Express app
const app = express();

// Trust proxy (important for rate limiting and getting real IP)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.nodeEnv === 'production' 
    ? ['https://mediconnect.com', 'https://www.mediconnect.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Custom middleware
app.use(detectPlatform);
app.use(requestLogger);

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'MediConnect API Gateway',
    version: '1.0.0',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// API documentation endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MediConnect BD API Gateway',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      ai: '/api/ai',
      patients: '/api/patients',
      doctors: '/api/doctors',
      emergency: '/api/emergency',
      admin: '/api/admin'
    },
    platform: req.platform
  });
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 MediConnect API Gateway`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Backend service: ${config.backend.url}`);
  console.log(`🤖 AI Service: ${config.gemini.apiKey && config.gemini.apiKey !== 'PLACEHOLDER_API_KEY' ? 'Enabled ✅' : 'Disabled (API key not configured)'}`);
  console.log('='.repeat(50));
  console.log('\n📚 Available Endpoints:');
  console.log(`   - Authentication: http://localhost:${PORT}/api/auth`);
  console.log(`   - AI Services:    http://localhost:${PORT}/api/ai`);
  console.log(`   - Patients:       http://localhost:${PORT}/api/patients`);
  console.log(`   - Doctors:        http://localhost:${PORT}/api/doctors`);
  console.log(`   - Emergency:      http://localhost:${PORT}/api/emergency`);
  console.log(`   - Admin:          http://localhost:${PORT}/api/admin`);
  console.log(`   - Health:         http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
