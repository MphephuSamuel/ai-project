# ✅ Signup Endpoint Implementation Complete!

## What Was Added

### 1. **New Endpoint: POST `/signup`**
   - Registers new companies in your Supabase database
   - Secure password hashing using bcrypt
   - Email validation and duplicate detection
   - Stores: company_name, location, business_sector, email, telephone, hashed_password

### 2. **Security Features**
   - ✅ Passwords hashed with bcrypt (never stored in plain text)
   - ✅ Email validation using pydantic EmailStr
   - ✅ Duplicate email detection
   - ✅ Input validation (company_name required, password min 8 chars)

### 3. **Database Integration**
   - ✅ Connected to your Supabase database
   - ✅ Uses credentials from `.env` file
   - ✅ Automatic error handling for database constraints

### 4. **New Dependencies Installed**
   - `supabase` - Supabase Python client
   - `python-dotenv` - Environment variable management
   - `passlib[bcrypt]` - Password hashing
   - `email-validator` - Email validation

## Files Created/Modified

### Modified:
- `backend/api_app.py` - Added signup endpoint and Supabase integration
- `backend/requirements.txt` - Updated with all new dependencies

### Created:
- `backend/test_signup.py` - Python test script for signup endpoint
- `backend/Emissions_API.postman_collection.json` - Postman collection
- `backend/API_DOCUMENTATION.md` - Complete API documentation

## How to Use

### Start the Server
```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.api_app:app --reload --host 127.0.0.1 --port 8000
```

### Test in Postman
1. **URL:** `http://127.0.0.1:8000/signup`
2. **Method:** POST
3. **Headers:** `Content-Type: application/json`
4. **Body (raw JSON):**
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

### Expected Response (201 Created):
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

### If Email Already Exists (400 Bad Request):
```json
{
  "detail": "Email already registered"
}
```

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/signup` | POST | Register new company |
| `/predict` | POST | Predict CO2 emissions |

## Database Schema Used

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

## Security Notes

1. **Passwords are NEVER stored in plain text**
   - Hashed using bcrypt with cost factor 12
   - Cannot be reverse-engineered

2. **Email Validation**
   - Validated for proper format
   - Uniqueness enforced at database level

3. **Environment Variables**
   - Supabase credentials in `.env` file
   - Never committed to git (.env is in .gitignore)

## Testing

### Option 1: Python Script
```powershell
.\.venv\Scripts\python.exe backend/test_signup.py
```

### Option 2: Postman
Import `backend/Emissions_API.postman_collection.json`

### Option 3: Interactive Docs
Visit: `http://127.0.0.1:8000/docs`

## Integration with Frontend

Your frontend should send POST requests to:
```
http://127.0.0.1:8000/signup
```

With the JSON body containing company registration data.

The password will be automatically hashed before storage, so the frontend should send the plain password (over HTTPS in production).

## Next Steps

1. ✅ **Server is ready!** Start it with uvicorn command above
2. 📧 Test signup with Postman or the test script
3. 🔄 Integrate with your frontend signup form
4. 🔒 For production: Enable HTTPS and add authentication tokens

## Files You Can Use

- **Documentation:** `backend/API_DOCUMENTATION.md`
- **Postman Collection:** `backend/Emissions_API.postman_collection.json`
- **Test Script:** `backend/test_signup.py`
- **Main API:** `backend/api_app.py`

---

🎉 **Your API is now fully functional with both signup and prediction endpoints!**
