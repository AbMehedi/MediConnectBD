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

## 📅 COMPREHENSIVE IMPLEMENTATION PLAN

### 🎯 Project Status & Next Steps

**Current Status**: ✅ Enhanced backend with comprehensive healthcare models completed  
**Timeline**: 6-month implementation roadmap  
**Target**: Complete digital healthcare platform for Bangladesh

---

## 🚀 PHASE-BASED IMPLEMENTATION STRATEGY

### **PHASE 1: FOUNDATION ENHANCEMENT (4 weeks)**

#### Week 1-2: Enhanced Authentication & User Management
```
✅ COMPLETED:
├── Enhanced User Model (medical profiles, RBAC)
├── Doctor/Hospital models with relationships
├── Basic JWT authentication

🔄 HIGH PRIORITY TASKS:
├── Multi-factor Authentication (SMS/Email)
├── Password reset flow implementation  
├── User verification system
├── Profile management UI enhancement
└── Email/SMS notification services

Feasibility: ⭐⭐⭐⭐⭐ (Very High)
Effort: 2 developers × 2 weeks
Dependencies: Twilio (SMS), SendGrid (Email)
```

#### Week 3-4: Smart Appointment System
```
✅ COMPLETED:
├── Comprehensive Appointment Model
├── Basic booking controller logic
├── Doctor-patient relationships

🔄 IMMEDIATE IMPLEMENTATION:
├── Doctor availability calendar system
├── Time slot conflict prevention
├── Appointment confirmation workflow
├── Rescheduling system with validation
├── Payment integration (Stripe/bKash)
└── Automated reminder system

Feasibility: ⭐⭐⭐⭐ (High)
Effort: 2 developers × 2 weeks  
Dependencies: Calendar library, Payment gateways
```

### **PHASE 2: CORE HEALTHCARE FEATURES (6 weeks)**

#### Week 5-6: Real-time Queue Management
```
✅ COMPLETED:
├── Queue Model with position tracking
├── Queue Controller with business logic

🔄 CRITICAL FEATURES:
├── WebSocket integration for real-time updates
├── Queue display dashboard (hospitals)
├── Patient mobile notifications
├── Wait time estimation algorithms
├── Queue skip/reschedule handling
├── Digital token system
└── Multi-hospital queue management

Feasibility: ⭐⭐⭐⭐ (High)
Effort: 2 developers × 2 weeks
Dependencies: Socket.IO, Push notifications
```

#### Week 7-8: Hospital Resource Management
```
✅ COMPLETED:
├── Hospital Model with bed tracking
├── Equipment and resource fields

🔄 ESSENTIAL IMPLEMENTATION:
├── Real-time bed availability API
├── Admission/discharge workflow
├── Equipment booking system
├── Resource utilization dashboard
├── Cross-hospital resource search
├── Emergency bed allocation
└── Resource analytics

Feasibility: ⭐⭐⭐⭐ (High)
Effort: 2 developers × 2 weeks
Dependencies: Real-time database, Analytics
```

#### Week 9-10: Emergency Services Platform
```
✅ COMPLETED:
├── Emergency Model with triage system
├── GPS-based hospital assignment
├── Ambulance tracking foundation

🔄 LIFE-SAVING FEATURES:
├── One-touch emergency button
├── Real-time ambulance tracking UI
├── Emergency response dashboard
├── Automated hospital notifications
├── Family alert system
├── Response time optimization
└── Emergency analytics

Feasibility: ⭐⭐⭐⭐ (High)
Effort: 2 developers × 2 weeks
Dependencies: GPS services, Mapping API
```

### **PHASE 3: ADVANCED HEALTHCARE ECOSYSTEM (8 weeks)**

#### Week 11-12: AI-Powered Health Assistant
```
✅ COMPLETED:
├── Basic Gemini AI integration
├── Symptom analysis foundation

🔄 INTELLIGENT FEATURES:
├── Bengali language support
├── Medical knowledge database
├── Specialist recommendation engine
├── Drug interaction checker
├── Health risk assessment
├── Personalized health insights
└── Continuous learning system

Feasibility: ⭐⭐⭐⭐ (High)
Effort: 1 AI specialist + 1 developer × 2 weeks
Dependencies: Medical databases, Bengali NLP
```

#### Week 13-14: Telemedicine Platform
```
🔄 REVENUE-GENERATING FEATURES:
├── WebRTC video calling system
├── Digital prescription generation
├── Screen sharing for medical reports
├── Consultation recording (with consent)
├── Payment integration for teleconsults
├── Multi-participant calls (specialists)
├── Consultation history tracking
└── Call quality optimization

Feasibility: ⭐⭐⭐ (Medium-High)
Effort: 2 developers × 2 weeks
Dependencies: WebRTC, Digital signatures
```

#### Week 15-16: Diagnostic Services Integration
```
✅ COMPLETED:
├── Diagnostic Model with test tracking
├── Lab result management system

🔄 COMPREHENSIVE TESTING:
├── Lab partner API integration
├── Home sample collection scheduling
├── Test result notification system
├── Report generation and sharing
├── Insurance claim processing
├── Quality control workflow
└── Historical test comparison

Feasibility: ⭐⭐⭐ (Medium)
Effort: 2 developers × 2 weeks
Dependencies: Lab partner APIs, Insurance APIs
```

#### Week 17-18: Electronic Health Records (EHR)
```
🔄 COMPREHENSIVE HEALTH MANAGEMENT:
├── Complete medical history system
├── Vaccination record tracking
├── Chronic condition management
├── Family medical history
├── Health timeline visualization
├── Secure data sharing protocols
├── Doctor visit summaries
└── Medical document storage

Feasibility: ⭐⭐⭐⭐ (High)
Effort: 2 developers × 2 weeks
Dependencies: Document storage, Encryption
```

### **PHASE 4: ANALYTICS & INTELLIGENCE (4 weeks)**

#### Week 19-20: Health Analytics Dashboard
```
🔄 DATA-DRIVEN INSIGHTS:
├── Personal health dashboards
├── Health trend analysis
├── Preventive care recommendations
├── Hospital performance metrics
├── Doctor efficiency analytics
├── Patient satisfaction tracking
├── Resource utilization insights
└── Predictive health modeling

Feasibility: ⭐⭐⭐ (Medium)
Effort: 1 data scientist + 1 developer × 2 weeks
Dependencies: Analytics platform, ML models
```

#### Week 21-22: Population Health Features
```
🔄 PUBLIC HEALTH IMPACT:
├── Disease outbreak tracking
├── Public health dashboards
├── Vaccination campaign management
├── Health awareness notifications
├── Community health insights
├── Government health reporting
├── Epidemiological data collection
└── Health policy impact analysis

Feasibility: ⭐⭐ (Medium)
Effort: 1 data scientist + 1 developer × 2 weeks
Dependencies: Government APIs, Health data
```

### **PHASE 5: MOBILE & PRODUCTION READY (4 weeks)**

#### Week 23-24: Mobile Application
```
🔄 ACCESSIBILITY ENHANCEMENT:
├── React Native mobile app
├── Offline functionality
├── Push notifications
├── Biometric authentication
├── Camera integration (prescription scanning)
├── GPS integration
├── Background health monitoring
└── App store optimization

Feasibility: ⭐⭐⭐⭐ (High)
Effort: 2 mobile developers × 2 weeks
Dependencies: React Native, Mobile certificates
```

#### Week 25-26: Production Optimization
```
🔄 SCALABILITY & PERFORMANCE:
├── Load balancing configuration
├── Database optimization
├── CDN integration
├── Security hardening
├── Performance monitoring
├── Auto-scaling setup
├── Backup and disaster recovery
└── Documentation and training

Feasibility: ⭐⭐⭐⭐⭐ (Very High)
Effort: 1 DevOps + 1 developer × 2 weeks
Dependencies: Cloud infrastructure
```

---

## 📊 RESOURCE REQUIREMENTS

### **Team Composition (9 members)**
```
Core Development (6):
├── 2 × Full-stack Developers (React + Node.js)
├── 1 × Frontend Specialist (React/TypeScript)
├── 1 × Mobile Developer (React Native)
├── 1 × AI/ML Engineer (Python/TensorFlow)
└── 1 × DevOps Engineer (AWS/Docker)

Support Team (3):
├── 1 × Product Manager
├── 1 × UI/UX Designer
└── 1 × QA Engineer
```

### **Monthly Infrastructure Costs**
```
DEVELOPMENT ENVIRONMENT:
├── Cloud hosting (AWS/Azure): $200-500
├── Database hosting: $100-300
├── CDN services: $50-100
├── Third-party APIs: $200-400
└── Development tools: $100-200
Total Development: $650-1,500/month

PRODUCTION ENVIRONMENT:
├── Cloud hosting: $1,000-3,000
├── Database: $500-1,500
├── CDN: $200-500
├── APIs & services: $1,000-2,500
└── Monitoring: $100-300
Total Production: $2,800-7,800/month
```

---

## 🎯 SUCCESS METRICS & KPIs

### **Technical Performance Targets**
```
SYSTEM PERFORMANCE:
├── API response time: < 200ms
├── Uptime target: 99.9%
├── Real-time updates: < 1 second latency
├── Mobile app load: < 3 seconds
└── Database queries: < 100ms

SCALABILITY TARGETS:
├── Concurrent users: 100,000+
├── Monthly appointments: 1M+
├── Hospitals onboarded: 10,000+
├── Doctors registered: 50,000+
└── Patient records: 5M+
```

### **Business Impact Goals**
```
USER ADOPTION (Year 1):
├── Registered users: 1M+
├── Monthly active users: 70%
├── App store rating: 4.5+
├── Wait time reduction: 60%
└── Doctor efficiency: +40%

REVENUE PROJECTIONS:
├── Hospital subscriptions: $5-10/month
├── Transaction fees: 2-3%
├── Premium features: $2-5/month
├── Telemedicine: $1-3/consultation
└── Target ARR: $1M+ (Year 1)
```

---

## ⚠️ RISK MITIGATION STRATEGIES

### **High-Risk Areas**
```
TECHNICAL RISKS:
├── Database scaling issues
   → Solution: Implement read replicas early
├── Real-time performance bottlenecks  
   → Solution: Load testing and optimization
├── Security vulnerabilities
   → Solution: Regular security audits

BUSINESS RISKS:
├── Regulatory compliance (health data)
   → Solution: Legal consultation
├── Doctor adoption resistance
   → Solution: Training and incentives
├── Rural connectivity issues
   → Solution: Offline-first mobile design
```

---

## 🚀 IMMEDIATE NEXT STEPS (Week 1)

### **Priority 1: Authentication Enhancement**
1. Set up Twilio account for SMS
2. Configure SendGrid for emails
3. Implement MFA in user controller
4. Create verification UI components
5. Test end-to-end authentication flow

### **Priority 2: Development Environment**
1. Set up development team workspace
2. Configure CI/CD pipeline
3. Set up testing framework
4. Create API documentation with Swagger
5. Implement code quality tools (ESLint, Prettier)

### **Priority 3: Third-party Integrations**
1. Payment gateway setup (Stripe, bKash)
2. Google Maps API configuration
3. Socket.IO real-time setup
4. Push notification service
5. Cloud infrastructure provisioning

---

## 📋 IMPLEMENTATION READINESS CHECKLIST

### **✅ READY (Completed)**
- [x] Enhanced backend with 8 comprehensive models
- [x] Database relationships and foreign keys
- [x] API Gateway architecture
- [x] Basic authentication system
- [x] Development environment setup
- [x] Version control and Git workflow
- [x] Core healthcare workflows mapped

### **🔄 IN PROGRESS (Immediate)**
- [ ] Multi-factor authentication
- [ ] Payment gateway integration
- [ ] Real-time WebSocket setup
- [ ] Mobile app framework
- [ ] Cloud infrastructure
- [ ] Third-party API accounts
- [ ] Team onboarding process

### **📋 PLANNING (Next 2 weeks)**
- [ ] UI/UX design system
- [ ] Testing framework setup
- [ ] Security audit preparation
- [ ] Performance monitoring setup
- [ ] Documentation system
- [ ] User acceptance testing plan
- [ ] Go-to-market strategy

---

## 💡 FEASIBILITY ASSESSMENT

### **Why This Plan is Achievable**

1. **Solid Foundation**: ✅ Comprehensive backend already implemented
2. **Proven Technology Stack**: Using mature, well-documented technologies
3. **Modular Architecture**: Each phase builds incrementally
4. **Risk Mitigation**: Multiple backup plans for critical components
5. **Resource Allocation**: Realistic team size and timeline
6. **Market Validation**: Clear demand for digital healthcare in Bangladesh

### **Key Success Factors**

1. **Team Experience**: Hire experienced developers in each domain
2. **Agile Methodology**: Weekly sprints with continuous feedback
3. **User-Centric Design**: Regular user testing and feedback integration
4. **Performance Focus**: Continuous monitoring and optimization
5. **Security First**: Healthcare data requires maximum security
6. **Scalability Planning**: Design for growth from day one

---

**Status**: 📋 **COMPREHENSIVE FEASIBLE PLAN READY**  
**Next Action**: Begin Phase 1 with MFA implementation  
**Success Probability**: ⭐⭐⭐⭐ (Very High with proper execution)  
**Timeline**: 26 weeks to production-ready platform

---

<div align="center">

**Made with ❤️ for Bangladesh Healthcare**

</div>
