# Emissions Model API - Backend Documentation

## Overview
REST API for company registration and CO2 emissions prediction using a trained RandomForest model.

## Features
- ✅ Company signup with secure password hashing (bcrypt)
- ✅ Email validation and duplicate detection
- ✅ CO2 emissions prediction (single and batch)
- ✅ Supabase database integration
- ✅ Environment-based configuration

## Tech Stack
- **Framework**: FastAPI
- **Database**: Supabase (PostgreSQL)
- **ML Model**: Scikit-learn RandomForestRegressor
- **Password Hashing**: Passlib with bcrypt
- **Validation**: Pydantic with email-validator

## Setup

### 1. Install Dependencies
```powershell
.\.venv\Scripts\pip install -r backend/requirements.txt
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database Schema
```sql
CREATE TABLE companies (
    company_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    business_sector VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    telephone VARCHAR(50),
    password TEXT NOT NULL
);
```

### 4. Run the Server
```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.api_app:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at: `http://127.0.0.1:8000`

Interactive docs: `http://127.0.0.1:8000/docs`

## API Endpoints

### 1. Health Check
**GET** `/`

Returns API status and available endpoints.

**Response:**
```json
{
  "status": "running",
  "endpoints": {
    "POST /signup": "Register a new company",
    "POST /predict": "Predict CO2 emissions"
  }
}
```

---

### 2. Company Signup
**POST** `/signup`

Register a new company account. Passwords are hashed using bcrypt before storage.

**Request Body:**
```json
{
  "company_name": "Green Energy Corp",
  "location": "San Francisco, CA",
  "business_sector": "Renewable Energy",
  "email": "info@greenenergy.com",
  "telephone": "+1-555-0123",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `company_name`: Required, 1-255 characters
- `location`: Optional, max 255 characters
- `business_sector`: Optional, max 255 characters
- `email`: Required, must be valid email format
- `telephone`: Optional, max 50 characters
- `password`: Required, minimum 8 characters

**Success Response (201):**
```json
{
  "company_id": 1,
  "company_name": "Green Energy Corp",
  "location": "San Francisco, CA",
  "business_sector": "Renewable Energy",
  "email": "info@greenenergy.com",
  "telephone": "+1-555-0123",
  "message": "Company registered successfully"
}
```

**Error Responses:**
- `400`: Email already registered or validation error
- `500`: Server error during registration

---

### 3. Predict CO2 Emissions
**POST** `/predict`

Predict CO2 emissions based on operational data.

#### Single Sample
**Request:**
```json
{
  "sample": {
    "electricity_kwh": 1000,
    "diesel_litres": 50,
    "output_tons": 200,
    "temp_c": 25,
    "equipment_load_pct": 60
  }
}
```

**Response:**
```json
{
  "co2e_total_kg": 1234.56
}
```

#### Batch Samples
**Request:**
```json
{
  "samples": [
    {
      "electricity_kwh": 1000,
      "diesel_litres": 50,
      "output_tons": 200
    },
    {
      "electricity_kwh": 1500,
      "diesel_litres": 75,
      "output_tons": 300
    }
  ]
}
```

**Response:**
```json
{
  "predictions": [
    {"co2e_total_kg": 1234.56},
    {"co2e_total_kg": 1850.78}
  ]
}
```

**Available Features:**
The model accepts 21 features (missing features default to 0):
- `electricity_kwh` - Electricity consumption in kWh
- `diesel_litres` - Diesel fuel consumption in liters
- `output_tons` - Production output in tons
- `temp_c` - Temperature in Celsius
- `equipment_load_pct` - Equipment load percentage
- `shift` - Shift ID (0=A, 1=B, 2=C)
- `hour` - Hour of day (0-23)
- `dow` - Day of week (0-6)
- `is_weekend` - Weekend indicator (0/1)
- Lag features: `*_lag1`, `*_lag4`
- Rolling averages: `*_roll4`, `*_roll96`

**Error Responses:**
- `400`: Invalid request format
- `500`: Model feature list not available
- `503`: Model file not found

## Testing

### Using Python Script
```powershell
.\.venv\Scripts\python.exe backend/test_signup.py
```

### Using Postman
1. Import `backend/Emissions_API.postman_collection.json`
2. Use the pre-configured requests

### Using cURL

**Signup:**
```bash
curl -X POST http://127.0.0.1:8000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Company",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Predict:**
```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "sample": {
      "electricity_kwh": 1000,
      "diesel_litres": 50,
      "output_tons": 200
    }
  }'
```

## Model Information

**Model Type:** RandomForestRegressor (scikit-learn)

**Performance:**
- R² Score: 0.999981
- MAE: 4.13 kg CO2
- RMSE: 5.47 kg CO2

**Training Data:** 69,144 IoT sensor readings from industrial sites

**Features:** 21 engineered features including lag variables and rolling averages

## Security

- Passwords hashed using bcrypt (cost factor 12)
- Email uniqueness enforced at database level
- Input validation using Pydantic models
- Environment variables for sensitive credentials
- HTTPS recommended for production

## Error Handling

All endpoints return structured error responses:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `500`: Internal Server Error
- `503`: Service Unavailable (model not loaded)

## Production Deployment

1. Use a production ASGI server (Gunicorn + Uvicorn workers)
2. Enable HTTPS/TLS
3. Set up proper environment variable management
4. Configure CORS for frontend integration
5. Implement rate limiting
6. Add authentication/authorization for protected endpoints
7. Set up logging and monitoring

## Support

For issues or questions, check:
- FastAPI docs: https://fastapi.tiangolo.com/
- Supabase docs: https://supabase.com/docs
- Interactive API docs: http://127.0.0.1:8000/docs
