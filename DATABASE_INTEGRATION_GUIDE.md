# MediConnect BD - Database Integration Guide

This document explains how to set up and use the three-layer architecture with database connectivity.

## Architecture Overview

```
Frontend (React) → API Gateway (Port 4000) → Backend (Port 5000) → Database (MySQL/XAMPP)
```

## Prerequisites

1. **XAMPP** - for MySQL database
2. **Node.js** - for running the applications
3. All dependencies installed in each layer

## Setup Instructions

### 1. Database Setup (XAMPP)

1. **Start XAMPP MySQL Service**
   ```bash
   # Open XAMPP Control Panel and start MySQL
   ```

2. **Create Database**
   - Open phpMyAdmin: http://localhost/phpmyadmin
   - Create a new database named `mediconnect`
   - Or use SQL: `CREATE DATABASE mediconnect;`

3. **Create Tables**
   ```bash
   # Option 1: Run the setup script
   cd backend
   npm run setup-db
   
   # Option 2: Manual setup
   # Copy content from database/create_tables.sql
   # Execute in phpMyAdmin or MySQL client
   ```

### 2. Environment Configuration

**Backend (.env)**
```env
PORT=5000
NODE_ENV=development

# MySQL Database (XAMPP Default - No Password)
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=mediconnect
DB_PORT=3306

JWT_SECRET=mediconnect-jwt-secret-key-change-in-production
```

**API Gateway (.env)**
```env
PORT=4000
NODE_ENV=development
BACKEND_URL=http://localhost:5000
JWT_SECRET=mediconnect-jwt-secret-key-change-in-production
GEMINI_API_KEY=your_gemini_api_key_here
```

**Frontend (.env.local)**
```env
VITE_API_GATEWAY_URL=http://localhost:4000/api
VITE_APP_NAME=MediConnect BD
VITE_APP_VERSION=1.0.0
```

### 3. Test Database Connection

```bash
cd backend
npm run test-db
```

Expected output:
```
✅ MySQL Database Connected Successfully
📊 Found X tables in database
✅ Users table structure verified
✅ Current user count: 0
🎉 Database connection test completed successfully!
```

### 4. Start All Services

**Terminal 1: Backend**
```bash
cd backend
npm run dev
# Should show: Server running on port 5000
```

**Terminal 2: API Gateway**
```bash
cd api-gateway
npm run dev
# Should show: API Gateway running on port 4000
```

**Terminal 3: Frontend**
```bash
npm run dev
# Should show: Local server running (typically port 5173)
```

## API Endpoints

### Authentication Endpoints (via API Gateway)

```bash
# Register User
POST http://localhost:4000/api/auth/register
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "01712345678",
    "role": "PATIENT",
    "gender": "MALE"
}

# Login User
POST http://localhost:4000/api/auth/login
{
    "email": "john@example.com",
    "password": "password123"
}

# Get Profile (requires token)
GET http://localhost:4000/api/patients/profile
Headers: Authorization: Bearer <token>
```

## Database Schema

### Core Tables

1. **users** - All users (patients, doctors, admins)
2. **hospitals** - Hospital information
3. **doctors** - Doctor-specific data
4. **appointments** - Appointment bookings
5. **emergencies** - Emergency requests
6. **ambulances** - Ambulance services
7. **queues** - Real-time queue management
8. **diagnostics** - Diagnostic reports

## Data Flow Example

1. **Frontend** makes API call to API Gateway
   ```javascript
   const response = await authAPI.login(email, password);
   ```

2. **API Gateway** receives request and proxies to Backend
   ```javascript
   await proxyToBackend(req, res, '/api/users/login');
   ```

3. **Backend** processes request with database
   ```javascript
   const users = await selectQuery(
     'SELECT * FROM users WHERE email = ?',
     [email]
   );
   ```

4. **Database** returns data through the chain back to Frontend

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if XAMPP MySQL is running
   - Verify port 3306 is available

2. **Database Not Found**
   - Create `mediconnect` database in phpMyAdmin
   - Check database name in .env file

3. **Table Doesn't Exist**
   - Run `npm run setup-db` in backend directory
   - Or manually execute `database/create_tables.sql`

4. **Authentication Errors**
   - Ensure JWT_SECRET matches in both API Gateway and Backend
   - Check if user exists in database

### Quick Checks

```bash
# Test backend directly
curl http://localhost:5000/api/health

# Test API gateway
curl http://localhost:4000/health

# Check database connection
cd backend && npm run test-db
```

## Development Notes

- **XAMPP Default**: MySQL root user has no password
- **JWT Tokens**: Shared secret between API Gateway and Backend
- **CORS**: Frontend allowed to connect to API Gateway
- **Database**: Direct SQL queries (no ORM dependencies)
- **Real-time**: Socket.io integration for live updates

## Production Considerations

1. **Security**: Change JWT secrets, add password to MySQL
2. **HTTPS**: Use SSL certificates
3. **Database**: Set up proper MySQL user with limited privileges
4. **Environment**: Use production environment variables
5. **Rate Limiting**: Configure appropriate limits for production