# Backend API Documentation

## Overview
This document provides comprehensive documentation for the AI-Powered Crop Disease Detection backend API.

---

## Server Configuration

### Main Server (`server.js`)
- **Port**: 5000 (configurable via `.env`)
- **Framework**: Express.js
- **CORS**: Enabled for `http://localhost:5173`
- **File Uploads**: Multer (10MB limit, images only)
- **Upload Directory**: `./uploads/`

### Environment Variables (`.env`)
```env
PORT=5000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENWEATHER_API_KEY=your-openweather-api-key

# Roboflow Configuration
ROBOFLOW_API_KEY=your-roboflow-api-key
ROBOFLOW_WORKSPACE=your-workspace
ROBOFLOW_WORKFLOW_ID=your-workflow-id

# Offline Model Configuration (NEW)
USE_OFFLINE_MODEL=false
MODEL_PATH=./models/crop-disease-model.onnx
MODEL_INPUT_SIZE=640
```

**Offline Model**: Set `USE_OFFLINE_MODEL=true` to enable local ONNX inference. See [OFFLINE_MODEL_SETUP.md](OFFLINE_MODEL_SETUP.md) for detailed setup instructions.


---

## API Routes

### 1. Authentication (`/api/auth`)
**File**: `routes/auth.js`

#### POST `/api/auth/register`
Register a new user.

**Request Body**:
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "password": "password123",
  "language": "en"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "phone": "1234567890",
      "language": "en"
    }
  }
}
```

#### POST `/api/auth/login`
Login existing user.

**Request Body**:
```json
{
  "phone": "1234567890",
  "password": "password123"
}
```

**Response**: Same as register

---

### 2. Disease Analysis (`/api/disease`)
**File**: `routes/disease.js`

#### POST `/api/disease/analyze`
Analyze crop disease from uploaded image.

**Request**: `multipart/form-data`
- `image`: Image file (JPEG, PNG)
- `language`: Language code (en, hi, ta)

**Response**:
```json
{
  "success": true,
  "data": {
    "disease": "Tomato Late Blight",
    "confidence": 92,
    "severity": "High",
    "description": "Disease description...",
    "treatment": ["Treatment step 1", "Treatment step 2"],
    "prevention": ["Prevention tip 1", "Prevention tip 2"],
    "imageUrl": "/uploads/disease-123456.jpg"
  }
}
```

---

### 3. Weather Information (`/api/weather`)
**File**: `routes/weather.js`

#### GET `/api/weather/current`
Get current weather for location.

**Query Parameters**:
- `lat`: Latitude
- `lon`: Longitude
- `language`: Language code (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "temperature": 28,
    "humidity": 65,
    "windSpeed": 12,
    "condition": "Partly Cloudy",
    "description": "Weather description...",
    "icon": "weather-icon-code"
  }
}
```

#### GET `/api/weather/forecast`
Get 5-day weather forecast.

**Query Parameters**: Same as current weather

**Response**:
```json
{
  "success": true,
  "data": {
    "forecast": [
      {
        "date": "2024-02-08",
        "temp": 28,
        "condition": "Sunny",
        "humidity": 60,
        "rainfall": 0
      }
    ]
  }
}
```

---

### 4. AI Chatbot (`/api/chat`)
**File**: `routes/chat.js`

#### POST `/api/chat/message`
Send message to AI agricultural advisor.

**Request Body**:
```json
{
  "message": "How do I treat tomato blight?",
  "language": "en",
  "conversationHistory": []
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "response": "AI response text...",
    "conversationHistory": [
      { "role": "user", "content": "..." },
      { "role": "assistant", "content": "..." }
    ]
  }
}
```

**Supported Languages**:
- English (`en`)
- Hindi (`hi`)
- Tamil (`ta`)

---

### 5. Location Services (`/api/location`)
**File**: `routes/location.js`

#### GET `/api/location/reverse`
Reverse geocode coordinates to address.

**Query Parameters**:
- `lat`: Latitude
- `lon`: Longitude

**Response**:
```json
{
  "success": true,
  "data": {
    "address": "City, State, Country",
    "city": "City Name",
    "state": "State Name",
    "country": "Country Name"
  }
}
```

#### GET `/api/location/search`
Search for locations by name.

**Query Parameters**:
- `query`: Search query

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "name": "Location Name",
      "lat": 12.34,
      "lon": 56.78,
      "country": "Country"
    }
  ]
}
```

---

### 6. Soil Analysis (`/api/soil`)
**File**: `routes/soil.js`

#### POST `/api/soil/analyze`
Analyze soil from uploaded image.

**Request**: `multipart/form-data`
- `image`: Image file (JPEG, PNG)
- `language`: Language code (en, hi, ta)

**Response**:
```json
{
  "success": true,
  "data": {
    "soilType": "Loamy Soil",
    "status": "Healthy",
    "phLevel": "6.5",
    "nitrogen": "Medium",
    "phosphorus": "High",
    "potassium": "Medium",
    "recommendations": [
      "Add organic compost",
      "Maintain pH level between 6.0-7.0"
    ],
    "imageUrl": "/uploads/soil-123456.jpg"
  }
}
```

---

### 7. SMS Notifications (`/api/sms`)
**File**: `routes/sms.js`

#### POST `/api/sms/send`
Send SMS notification.

**Request Body**:
```json
{
  "to": "1234567890",
  "message": "SMS message content",
  "language": "en"
}
```

**Response**:
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "data": {
    "messageId": "msg-123",
    "status": "sent"
  }
}
```

---

### 8. Agriculture Data (`/api/agriculture`)
**File**: `routes/agriculture.js`

#### GET `/api/agriculture/specialists`
Get list of agricultural specialists.

**Query Parameters**:
- `lat`: Latitude (optional)
- `lon`: Longitude (optional)
- `language`: Language code (optional)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Dr. Specialist Name",
      "role": "Agricultural Expert",
      "phone": "1234567890",
      "distance": 5.2,
      "location": {
        "lat": 12.34,
        "lon": 56.78
      }
    }
  ]
}
```

---

## Error Handling

All routes follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error message description"
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `400`: Bad Request (missing/invalid parameters)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `500`: Internal Server Error

---

## File Upload Configuration

**Multer Settings**:
- **Max File Size**: 10MB
- **Allowed Types**: JPEG, JPG, PNG, GIF
- **Storage**: `./uploads/` directory
- **Naming**: `{fieldname}-{timestamp}-{random}.{ext}`

---

## Authentication

**JWT Token**:
- **Secret**: Configured in `.env` as `JWT_SECRET`
- **Expiry**: 30 days
- **Header**: `Authorization: Bearer {token}`

**Protected Routes**: Currently, most routes are public. Add authentication middleware as needed.

---

## External APIs Used

1. **OpenWeatherMap API**
   - Weather data
   - Forecasts
   - Requires `OPENWEATHER_API_KEY`

2. **Anthropic Claude API**
   - AI chatbot functionality
   - Model: Claude 3 Sonnet
   - Requires `ANTHROPIC_API_KEY`

3. **Roboflow AI (Cloud/Offline)**
   - **Cloud Mode**: Serverless workflow API for disease detection
   - **Offline Mode**: Local ONNX model inference
   - Requires `ROBOFLOW_API_KEY` for cloud mode
   - Requires `.onnx` model file for offline mode
   - **Fallback Chain**: Offline → Cloud → Mock data
   - See [OFFLINE_MODEL_SETUP.md](OFFLINE_MODEL_SETUP.md) for offline setup

## Services

**New Offline Inference Services:**
- `services/offline_inference.service.js` - ONNX Runtime inference engine
- `services/model_downloader.js` - Interactive model download utility
- `services/roboflow.service.js` - Updated with offline/online fallback

**Inference Modes:**
- `offline` - Uses local ONNX model (fastest, no internet)
- `online` - Uses Roboflow cloud API (requires internet)
- `unavailable` - Falls back to mock data

---

## Database

**Current**: In-memory storage (users array)

**Recommended for Production**:
- MongoDB for user data and conversation history
- PostgreSQL for structured data
- Redis for session management

---

## Running the Backend

### Development
```bash
npm run server
```

### Production
```bash
npm start
```

### With Frontend (Concurrent)
```bash
npm run dev
```

---

## Backend File Structure

```
AI-powered-crop-disease-detection-1/
├── server.js                 # Main server file
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── disease.js           # Disease analysis routes
│   ├── weather.js           # Weather data routes
│   ├── chat.js              # AI chatbot routes
│   ├── location.js          # Location services routes
│   ├── soil.js              # Soil analysis routes
│   ├── sms.js               # SMS notification routes
│   └── agriculture.js       # Agriculture data routes
├── uploads/                 # File upload directory
├── .env                     # Environment variables
└── package.json             # Dependencies
```

---

## Dependencies

**Core**:
- `express`: Web framework
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variables
- `multer`: File upload handling

**Authentication**:
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT tokens

**External APIs**:
- `@anthropic-ai/sdk`: Claude AI integration
- `axios`: HTTP requests

---

## Next Steps for Production

1. **Add Database**: Replace in-memory storage with MongoDB/PostgreSQL
2. **Add Authentication Middleware**: Protect routes with JWT verification
3. **Add Rate Limiting**: Prevent API abuse
4. **Add Logging**: Winston or Morgan for request logging
5. **Add Validation**: Express-validator for input validation
6. **Add Tests**: Jest/Mocha for API testing
7. **Add API Documentation**: Swagger/OpenAPI
8. **Deploy**: Use PM2 for process management

---

## Support

For issues or questions, refer to the main README.md or contact the development team.
