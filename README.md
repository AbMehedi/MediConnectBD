<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# MediConnect BD

**AI-Powered Healthcare Management Platform for Bangladesh**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.0.0-61dafb.svg)](https://reactjs.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)

---

## 🏥 Overview

MediConnect BD is a comprehensive healthcare management platform designed for Bangladesh, featuring:

- **AI-Powered Symptom Analysis** using Google Gemini AI
- **Multi-User System** (Patients, Doctors, Hospitals, Admins)
- **Telemedicine** capabilities
- **Emergency Services** integration
- **Appointment Management**
- **Medical Records** tracking
- **Queue Management** system
- **Real-time Communication** via Socket.IO

---

## 🏗️ Architecture

### 3-Tier Architecture with API Gateway

```
┌─────────────────┐
│   Frontend      │
│  React + Vite   │  ← Web Application (Port 3000)
│  (TypeScript)   │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  API Gateway    │  ← Unified API Layer (Port 4000)
│   (Express.js)  │
│                 │
│  • Auth & JWT   │
│  • Rate Limit   │
│  • Caching      │
│  • AI Services  │
│  • Validation   │
└────────┬────────┘
         │ Internal
         ▼
┌─────────────────┐
│   Backend       │  ← Business Logic (Port 5000)
│  (Express.js)   │
│                 │
│  • REST API     │
│  • Socket.IO    │
│  • Sequelize    │
└────────┬────────┘
         │
         ▼
   ┌──────────┐
   │  MySQL   │  ← Database (Port 3306)
   └──────────┘
```

### Why API Gateway?

✅ **Security** - API keys never exposed to frontend  
✅ **Scalability** - Easy to add mobile apps, IoT devices  
✅ **Rate Limiting** - Protect against abuse  
✅ **Caching** - Improved performance  
✅ **Monitoring** - Centralized logging  
✅ **Versioning** - Support multiple API versions  

---

## ✨ Features

### For Patients
- 🔍 AI-powered symptom checker
- 📅 Book appointments with doctors
- 💬 Telemedicine consultations
- 📊 View medical history
- 🚑 Emergency service access
- 💊 Prescription tracking

### For Doctors
- 👥 Patient management
- 📋 Appointment scheduling
- 💻 Virtual consultations
- 📝 Prescription writing
- 📈 Patient analytics

### For Hospitals
- 🏥 Resource management (ICU beds, equipment)
- 🎫 Queue management system
- 📊 Dashboard analytics
- 👨‍⚕️ Doctor verification

### For Admins
- 👨‍💼 User management
- 📈 System analytics
- 🔐 Access control
- ⚙️ System configuration

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Lucide React** - Icons
- **Recharts** - Data visualization

### API Gateway
- **Express.js** - Web framework
- **JWT** - Authentication
- **Express Rate Limit** - Rate limiting
- **Helmet** - Security headers
- **Node-Cache** - Caching
- **@google/generative-ai** - Gemini AI integration

### Backend
- **Express.js** - Web framework
- **Sequelize** - ORM
- **MySQL2** - Database driver
- **Socket.IO** - Real-time communication
- **bcryptjs** - Password hashing

### Database
- **MySQL** - Relational database

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.x
- MySQL >= 8.x
- npm >= 8.x
- Gemini API Key ([Get it here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AbMehedi/MediConnectBD.git
cd MediConnectBD
```

2. **Install dependencies**

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install API Gateway dependencies
cd api-gateway
npm install
cd ..
```

3. **Configure Environment Variables**

**Backend** (`backend/.env`):
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=mediconnect
JWT_SECRET=your-jwt-secret
```

**API Gateway** (`api-gateway/.env`):
```env
PORT=4000
BACKEND_URL=http://localhost:5000
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend** (`.env.local`):
```env
VITE_API_GATEWAY_URL=http://localhost:4000/api
```

4. **Set up Database**

```bash
# Create database
mysql -u root -p
CREATE DATABASE mediconnect;
EXIT;
```

5. **Start the Application**

Open 3 terminal windows:

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - API Gateway**:
```bash
cd api-gateway
npm run dev
```

**Terminal 3 - Frontend**:
```bash
npm run dev
```

6. **Access the Application**

- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- Backend: http://localhost:5000

---

## 📁 Project Structure

```
mediconnect-bd/
├── api-gateway/              # API Gateway Layer
│   ├── config/               # Configuration files
│   ├── middleware/           # Auth, rate limiting, caching
│   ├── routes/               # API routes
│   ├── services/             # AI services
│   ├── utils/                # Utilities
│   ├── server.js             # Main server
│   └── README.md             # Gateway documentation
│
├── backend/                  # Backend Service
│   ├── config/               # Database config
│   ├── controllers/          # Business logic
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── middleware/           # Auth middleware
│   └── server.js             # Main server
│
├── shared/                   # Shared Code (all platforms)
│   ├── constants.js          # Constants
│   ├── utils.js              # Utility functions
│   └── responses.js          # Response helpers
│
├── services/                 # Frontend Services
│   ├── apiClient.ts          # API client
│   └── geminiService.ts      # (Legacy) AI service
│
├── components/               # React Components
│   ├── AIChatbot.tsx
│   ├── ThemeSwitcher.tsx
│   └── UIComponents.tsx
│
├── views/                    # React Views
│   ├── LandingPage.tsx
│   ├── PatientPortal.tsx
│   ├── DoctorPortal.tsx
│   ├── AdminPortal.tsx
│   └── ...
│
├── App.tsx                   # Main App component
├── index.tsx                 # Entry point
├── vite.config.ts            # Vite configuration
└── README.md                 # This file
```

---

## 📚 API Documentation

Complete API documentation is available in [`api-gateway/README.md`](api-gateway/README.md)

### Quick Reference

```javascript
import { authAPI, aiAPI, patientAPI, doctorAPI } from './services/apiClient';

// Authentication
await authAPI.login('email@example.com', 'password');

// AI Services
await aiAPI.analyzeSymptoms('I have fever and headache');

// Patient Services
await patientAPI.bookAppointment(appointmentData);

// Doctor Services
await doctorAPI.getAppointments();
```

---

## 💻 Development

### Code Structure

- **Frontend**: React with TypeScript
- **API Gateway**: Express.js with middleware pattern
- **Backend**: Express.js with MVC pattern
- **Shared**: Reusable code for all platforms

### Adding New Features

1. **Add API endpoint** in `api-gateway/routes/`
2. **Add backend logic** in `backend/controllers/`
3. **Update API client** in `services/apiClient.ts`
4. **Use in frontend** components

### Running Tests

```bash
# Frontend
npm test

# Backend
cd backend
npm test

# API Gateway
cd api-gateway
npm test
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Update `NODE_ENV=production`
- [ ] Set strong `JWT_SECRET`
- [ ] Configure production CORS origins
- [ ] Set up proper database credentials
- [ ] Enable SSL/TLS
- [ ] Set up monitoring and logging
- [ ] Configure rate limits for production
- [ ] Set up backup strategies

### Deployment Options

**Option 1: Traditional Server**
```bash
# Use PM2 for process management
pm2 start backend/server.js --name mediconnect-backend
pm2 start api-gateway/server.js --name mediconnect-gateway
```

**Option 2: Docker**
```bash
docker-compose up -d
```

**Option 3: Cloud Platforms**
- Frontend: Vercel, Netlify
- Backend: AWS EC2, DigitalOcean
- Database: AWS RDS, DigitalOcean Managed MySQL

---

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- Helmet.js security headers
- CORS configuration
- SQL injection prevention (Sequelize ORM)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Developed by**: AbMehedi  
**GitHub**: [@AbMehedi](https://github.com/AbMehedi)  
**Repository**: [MediConnectBD](https://github.com/AbMehedi/MediConnectBD)

---

## 📞 Support

For support, email support@mediconnect.com or open an issue on GitHub.

---

<div align="center">

**Made with ❤️ for Bangladesh Healthcare**

</div>
