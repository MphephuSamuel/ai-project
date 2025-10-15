# System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (Your React/Vue/etc)                          │
│                                                                  │
│  ┌─────────────────┐         ┌──────────────────┐              │
│  │  Signup Form    │         │  Predict Form    │              │
│  └────────┬────────┘         └────────┬─────────┘              │
│           │                            │                         │
└───────────┼────────────────────────────┼─────────────────────────┘
            │                            │
            │ POST /signup               │ POST /predict
            │ {company_name,             │ {sample: {electricity_kwh,
            │  email,                    │           diesel_litres,
            │  password, ...}            │           output_tons, ...}}
            │                            │
            ▼                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                              │
│                  (localhost:8000)                               │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  API ENDPOINTS                         │    │
│  │                                                        │    │
│  │  GET  /          → Health Check                       │    │
│  │  POST /signup    → Register Company                   │    │
│  │  POST /predict   → Predict CO2 Emissions             │    │
│  └───────┬──────────────────────────────┬────────────────┘    │
│          │                               │                     │
│          │ /signup                       │ /predict            │
│          ▼                               ▼                     │
│  ┌────────────────┐            ┌──────────────────┐           │
│  │   Supabase     │            │   ML Model       │           │
│  │   Client       │            │   (joblib)       │           │
│  │                │            │                  │           │
│  │  • Hash pwd    │            │  • Load model    │           │
│  │  • Validate    │            │  • Fill missing  │           │
│  │  • Insert DB   │            │  • Predict CO2   │           │
│  └───────┬────────┘            └──────────────────┘           │
│          │                                                     │
└──────────┼─────────────────────────────────────────────────────┘
           │
           │ INSERT INTO companies
           │ VALUES (...)
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                             │
│                   (PostgreSQL)                                  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │               companies TABLE                          │    │
│  │                                                        │    │
│  │  company_id    | INT (auto-increment, PK)            │    │
│  │  company_name  | VARCHAR(255)                        │    │
│  │  location      | VARCHAR(255)                        │    │
│  │  business_sector | VARCHAR(255)                      │    │
│  │  email         | VARCHAR(255) UNIQUE                 │    │
│  │  telephone     | VARCHAR(50)                         │    │
│  │  password      | TEXT (bcrypt hashed)                │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                   ML MODEL COMPONENTS                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  model_development/emissions_model.joblib              │     │
│  │                                                        │     │
│  │  • RandomForestRegressor (scikit-learn)               │     │
│  │  • R² Score: 0.999981                                 │     │
│  │  • MAE: 4.13 kg CO2                                   │     │
│  │  • Trained on 69,144 IoT samples                      │     │
│  │  • 21 engineered features                             │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  model_development/model_manifest.json                 │     │
│  │                                                        │     │
│  │  • Feature names and types                            │     │
│  │  • Target variable name                               │     │
│  │  • Model metadata                                     │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘


DATA FLOW EXAMPLES:

1. SIGNUP FLOW:
   Frontend → POST /signup
      ↓
   Backend validates (Pydantic)
      ↓
   Hash password (bcrypt)
      ↓
   Insert to Supabase
      ↓
   Return company_id + message

2. PREDICT FLOW:
   Frontend → POST /predict
      ↓
   Backend loads model
      ↓
   Fill missing features with 0
      ↓
   Model.predict(features)
      ↓
   Return {co2e_total_kg: value}


SECURITY LAYERS:

┌─────────────────────────────┐
│  Input Validation           │  ← Pydantic models
├─────────────────────────────┤
│  Email Validation           │  ← email-validator
├─────────────────────────────┤
│  Password Hashing           │  ← bcrypt (passlib)
├─────────────────────────────┤
│  Database Constraints       │  ← Supabase (UNIQUE email)
├─────────────────────────────┤
│  Environment Variables      │  ← python-dotenv
└─────────────────────────────┘
```

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|----------|
| API Framework | FastAPI | High-performance async API |
| Database | Supabase (PostgreSQL) | Cloud PostgreSQL hosting |
| ML Framework | scikit-learn | RandomForest model |
| Password Hashing | bcrypt (passlib) | Secure password storage |
| Validation | Pydantic | Request/response validation |
| Email Validation | email-validator | Email format checking |
| Environment | python-dotenv | Config management |
| Server | Uvicorn | ASGI server |

## Request/Response Examples

### Signup Request:
```http
POST /signup HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "company_name": "EcoTech Solutions",
  "location": "Berlin, Germany",
  "business_sector": "Manufacturing",
  "email": "contact@ecotech.de",
  "telephone": "+49-30-12345",
  "password": "MySecurePass2024!"
}
```

### Signup Response (Success):
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "company_id": 42,
  "company_name": "EcoTech Solutions",
  "location": "Berlin, Germany",
  "business_sector": "Manufacturing",
  "email": "contact@ecotech.de",
  "telephone": "+49-30-12345",
  "message": "Company registered successfully"
}
```

### Predict Request:
```http
POST /predict HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "sample": {
    "electricity_kwh": 2500,
    "diesel_litres": 120,
    "output_tons": 450,
    "temp_c": 22,
    "equipment_load_pct": 75
  }
}
```

### Predict Response:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "co2e_total_kg": 2847.23
}
```
