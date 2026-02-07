# Backend Quick Reference

## All Backend Routes

### ✅ Implemented Routes

| Route | Method | File | Description |
|-------|--------|------|-------------|
| `/api/auth/register` | POST | `routes/auth.js` | User registration |
| `/api/auth/login` | POST | `routes/auth.js` | User login |
| `/api/disease/analyze` | POST | `routes/disease.js` | Crop disease analysis |
| `/api/weather/current` | GET | `routes/weather.js` | Current weather |
| `/api/weather/forecast` | GET | `routes/weather.js` | 5-day forecast |
| `/api/chat/message` | POST | `routes/chat.js` | AI chatbot |
| `/api/location/reverse` | GET | `routes/location.js` | Reverse geocoding |
| `/api/location/search` | GET | `routes/location.js` | Location search |
| `/api/soil/analyze` | POST | `routes/soil.js` | Soil analysis |
| `/api/sms/send` | POST | `routes/sms.js` | Send SMS |
| `/api/agriculture/specialists` | GET | `routes/agriculture.js` | Get specialists |

## Backend Files Overview

```
routes/
├── auth.js          (5.1 KB)  - Authentication & JWT
├── disease.js       (18.9 KB) - Disease detection
├── weather.js       (8.1 KB)  - Weather API integration
├── chat.js          (11.0 KB) - AI chatbot (Claude)
├── location.js      (2.3 KB)  - Location services
├── soil.js          (3.2 KB)  - Soil analysis
├── sms.js           (4.9 KB)  - SMS notifications
└── agriculture.js   (9.2 KB)  - Agriculture data
```

## Environment Setup

Required in `.env`:
```
PORT=5000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=your-key
OPENWEATHER_API_KEY=your-key
```

## Testing Routes

### Using cURL

**Register User**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"1234567890","password":"test123","language":"en"}'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"1234567890","password":"test123"}'
```

**Get Weather**:
```bash
curl "http://localhost:5000/api/weather/current?lat=28.6139&lon=77.2090&language=en"
```

**AI Chat**:
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"How to grow tomatoes?","language":"en","conversationHistory":[]}'
```

**Upload for Disease Analysis**:
```bash
curl -X POST http://localhost:5000/api/disease/analyze \
  -F "image=@/path/to/image.jpg" \
  -F "language=en"
```

**Upload for Soil Analysis**:
```bash
curl -X POST http://localhost:5000/api/soil/analyze \
  -F "image=@/path/to/soil.jpg" \
  -F "language=en"
```

## Common Issues

1. **CORS Error**: Check `CORS_ORIGIN` in `.env`
2. **Upload Error**: Ensure `uploads/` directory exists
3. **API Key Error**: Verify API keys in `.env`
4. **Port in Use**: Change `PORT` in `.env`

## Documentation

See `BACKEND_DOCUMENTATION.md` for complete API reference.
