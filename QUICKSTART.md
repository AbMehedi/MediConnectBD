# MediConnect BD - Quick Start Guide

## ⚡ Quick Setup (5 Minutes)

### Step 1: Start Backend Server

```bash
cd backend
npm run dev
```

✅ Backend running on http://localhost:5000

### Step 2: Start API Gateway

```bash
cd api-gateway
npm run dev
```

✅ API Gateway running on http://localhost:4000

### Step 3: Start Frontend

```bash
npm run dev
```

✅ Frontend running on http://localhost:3000

---

## 🧪 Test the Setup

### 1. Check Health Status

Open your browser:
- Backend: http://localhost:5000/health
- API Gateway: http://localhost:4000/health
- Frontend: http://localhost:3000

### 2. Test API Gateway

```bash
# Check API Gateway is working
curl http://localhost:4000

# Check AI service status
curl http://localhost:4000/api/ai/status
```

### 3. Test Authentication

```bash
# Register a new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role": "patient"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/web/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 📱 Architecture Overview

```
Frontend (3000) → API Gateway (4000) → Backend (5000) → MySQL (3306)
```

**What changed?**
- ✅ Frontend now calls API Gateway instead of Backend directly
- ✅ AI features (Gemini) moved to API Gateway
- ✅ Authentication, rate limiting, caching added
- ✅ Ready for mobile app integration

---

## 🔑 Configuration Summary

### Backend (Port 5000)
- Database operations
- Business logic
- Socket.IO for real-time

### API Gateway (Port 4000)
- Authentication & Authorization
- Rate limiting
- AI services (Gemini)
- Request validation
- Caching

### Frontend (Port 3000)
- React UI
- Calls API Gateway only

---

## 🚨 Troubleshooting

### Backend won't start
```bash
# Check MySQL is running
mysql -u root -p

# Create database if needed
CREATE DATABASE mediconnect;
```

### API Gateway can't connect to Backend
```bash
# Check backend is running
curl http://localhost:5000/health

# Update api-gateway/.env if needed
BACKEND_URL=http://localhost:5000
```

### AI features not working
```bash
# Add your Gemini API key to api-gateway/.env
GEMINI_API_KEY=your_actual_gemini_api_key
```

---

## 📚 Next Steps

1. **Configure Gemini API Key**
   - Get key from https://aistudio.google.com/app/apikey
   - Add to `api-gateway/.env`

2. **Test AI Features**
   - Try symptom analysis
   - Test chatbot

3. **Explore API Documentation**
   - Read `api-gateway/README.md`
   - Test endpoints with curl or Postman

4. **Start Building Features**
   - Add new routes in `api-gateway/routes/`
   - Implement backend logic
   - Update frontend to use new endpoints

---

## 🎯 Common Tasks

### Add a New API Endpoint

1. **API Gateway** (`api-gateway/routes/example.routes.js`):
```javascript
router.get('/example', authenticateToken, async (req, res) => {
  await proxyToBackend(req, res, '/api/example');
});
```

2. **Backend** (`backend/routes/exampleRoutes.js`):
```javascript
router.get('/example', authMiddleware, controller.getExample);
```

3. **Frontend** (`services/apiClient.ts`):
```javascript
export const exampleAPI = {
  async getExample() {
    return apiClient.get('/example');
  }
};
```

### Clear API Cache

```bash
curl -X POST http://localhost:4000/api/admin/cache/clear \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pattern": "/api/doctors"}'
```

---

## ✅ Success Checklist

- [ ] All 3 servers running (Backend, Gateway, Frontend)
- [ ] Can access frontend at http://localhost:3000
- [ ] Can register and login users
- [ ] Database connection working
- [ ] AI features configured (optional but recommended)

---

## 💡 Pro Tips

1. **Use different terminals** for each server - easier to see logs
2. **Install Postman** for API testing
3. **Enable React DevTools** for debugging frontend
4. **Check browser console** for any errors
5. **Read the logs** - they tell you what's happening

---

## 🆘 Need Help?

- Check `README.md` for detailed information
- Read `api-gateway/README.md` for API docs
- Open an issue on GitHub
- Review error logs in terminal

---

**You're all set! Start building amazing healthcare features! 🚀**
