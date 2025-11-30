# MediConnect BD - API Gateway

Complete API Gateway layer for MediConnect BD healthcare platform. Provides unified API access for web and mobile applications.

## 🚀 Features

- **Unified API Layer** - Single endpoint for all platforms (web, mobile, future IoT)
- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Rate Limiting** - Protect against abuse and DDoS attacks
- **Caching** - Improve performance with intelligent caching
- **AI Integration** - Gemini AI for symptom analysis and chatbot
- **Request Validation** - Input validation and sanitization
- **Error Handling** - Comprehensive error handling and logging
- **Platform Detection** - Automatic mobile/web detection
- **Security** - Helmet, CORS, compression, and more

## 📋 Prerequisites

- Node.js >= 16.x
- npm >= 8.x
- Backend service running on port 5000
- Gemini API key (for AI features)

## 🛠️ Installation

```bash
cd api-gateway
npm install
```

## ⚙️ Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables:
```env
PORT=4000
BACKEND_URL=http://localhost:5000
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

## 🏃 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Server will start on `http://localhost:4000`

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/web/login` | Login (web) | No |
| POST | `/api/auth/mobile/login` | Login (mobile with refresh token) | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/verify` | Verify token | Yes |
| POST | `/api/auth/logout` | Logout | Yes |

### AI Services (`/api/ai`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ai/analyze-symptoms` | Analyze patient symptoms | Optional |
| POST | `/api/ai/chat` | Chat with AI assistant | Optional |
| GET | `/api/ai/status` | Get AI service status | No |

### Patient Services (`/api/patients`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/patients/profile` | Get patient profile | Yes (Patient) |
| PUT | `/api/patients/profile` | Update patient profile | Yes (Patient) |
| GET | `/api/patients/appointments` | Get appointments | Yes (Patient) |
| POST | `/api/patients/appointments` | Book appointment | Yes (Patient) |
| DELETE | `/api/patients/appointments/:id` | Cancel appointment | Yes (Patient) |
| GET | `/api/patients/medical-history` | Get medical history | Yes (Patient) |

### Doctor Services (`/api/doctors`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/doctors` | Get all doctors | No |
| GET | `/api/doctors/:id` | Get doctor by ID | No |
| GET | `/api/doctors/profile/me` | Get doctor profile | Yes (Doctor) |
| PUT | `/api/doctors/profile` | Update doctor profile | Yes (Doctor) |
| GET | `/api/doctors/appointments/list` | Get appointments | Yes (Doctor) |
| PATCH | `/api/doctors/appointments/:id` | Update appointment | Yes (Doctor) |
| GET | `/api/doctors/patients/list` | Get patients | Yes (Doctor) |
| POST | `/api/doctors/prescriptions` | Add prescription | Yes (Doctor) |

### Emergency Services (`/api/emergency`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/emergency/hospitals` | Get nearby hospitals | No |
| GET | `/api/emergency/ambulances` | Get available ambulances | No |
| POST | `/api/emergency/request` | Request emergency service | Optional |
| GET | `/api/emergency/contacts` | Get emergency contacts | No |
| GET | `/api/emergency/track/:id` | Track ambulance | Optional |

### Admin Services (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | Get all users | Yes (Admin) |
| GET | `/api/admin/statistics` | Get system statistics | Yes (Admin) |
| PATCH | `/api/admin/doctors/:id/status` | Approve/reject doctor | Yes (Admin) |
| PUT | `/api/admin/hospitals/:id/resources` | Manage hospital resources | Yes (Admin) |
| POST | `/api/admin/cache/clear` | Clear API cache | Yes (Superadmin) |
| GET | `/api/admin/health` | Get system health | Yes (Admin) |

### Utility Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| GET | `/` | API documentation | No |

## 🔐 Authentication

### Web Login
```javascript
const response = await fetch('http://localhost:4000/api/auth/web/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

### Mobile Login (with Refresh Token)
```javascript
const response = await fetch('http://localhost:4000/api/auth/mobile/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Response includes refreshToken for mobile
const { token, refreshToken, expiresIn } = await response.json();
```

### Using Authentication
```javascript
const response = await fetch('http://localhost:4000/api/patients/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🤖 AI Integration

### Analyze Symptoms
```javascript
const response = await fetch('http://localhost:4000/api/ai/analyze-symptoms', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Optional
  },
  body: JSON.stringify({
    symptoms: 'I have fever, headache, and body pain'
  })
});

const { data } = await response.json();
// data: { specialist, urgency, advice, possibleConditions }
```

### Chat with AI
```javascript
const response = await fetch('http://localhost:4000/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What should I do for fever?',
    conversationHistory: []
  })
});
```

## 📱 Platform Detection

The API Gateway automatically detects the platform (web/mobile) based on User-Agent:

```javascript
// Platform information is available in req.platform
req.platform = {
  isMobile: boolean,
  isIOS: boolean,
  isAndroid: boolean,
  isWeb: boolean
}
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent abuse
- **JWT Authentication** - Secure authentication
- **Input Validation** - Request validation
- **Compression** - Response compression

## 📊 Rate Limiting

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| AI Services | 10 requests | 15 minutes |
| Mobile API | 50 requests | 15 minutes |

## 💾 Caching

Caching is implemented for frequently accessed endpoints:

- Doctors list: 5 minutes
- Hospital data: 3 minutes
- Emergency contacts: 1 hour
- User profiles: 2 minutes

Cache is automatically cleared when data is updated.

## 🧪 Testing

### Health Check
```bash
curl http://localhost:4000/health
```

### Test Authentication
```bash
curl -X POST http://localhost:4000/api/auth/web/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📁 Project Structure

```
api-gateway/
├── config/
│   └── config.js          # Configuration
├── middleware/
│   ├── auth.js            # Authentication middleware
│   ├── rateLimiter.js     # Rate limiting
│   ├── cache.js           # Caching
│   └── common.js          # Common middleware
├── routes/
│   ├── auth.routes.js     # Auth endpoints
│   ├── ai.routes.js       # AI endpoints
│   ├── patient.routes.js  # Patient endpoints
│   ├── doctor.routes.js   # Doctor endpoints
│   ├── emergency.routes.js# Emergency endpoints
│   └── admin.routes.js    # Admin endpoints
├── services/
│   └── aiService.js       # Gemini AI integration
├── utils/
│   └── proxy.js           # Backend proxy utility
├── .env.example           # Environment template
├── package.json           # Dependencies
├── server.js              # Main server file
└── README.md              # This file
```

## 🔄 Integration with Frontend

Update your frontend API calls to use the gateway:

```javascript
// Before (direct backend)
const API_URL = 'http://localhost:5000/api';

// After (via gateway)
const API_URL = 'http://localhost:4000/api';

// All API calls remain the same!
```

## 🌐 Production Deployment

1. Set environment to production:
```env
NODE_ENV=production
```

2. Update CORS origins:
```javascript
cors({
  origin: ['https://mediconnect.com', 'https://www.mediconnect.com']
})
```

3. Use process manager (PM2):
```bash
pm2 start server.js --name mediconnect-gateway
```

## 🐛 Troubleshooting

### Backend Connection Issues
```bash
# Check if backend is running
curl http://localhost:5000/health

# Update BACKEND_URL in .env if needed
```

### AI Service Not Working
```bash
# Verify Gemini API key
curl http://localhost:4000/api/ai/status
```

### Rate Limit Errors
```bash
# Wait 15 minutes or adjust limits in .env
```

## 📞 Support

For issues or questions, please contact the development team.

## 📄 License

Copyright © 2025 MediConnect BD. All rights reserved.
