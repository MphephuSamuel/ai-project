# Quick Start Guide

## 🚀 Start the Server

```powershell
cd C:\Users\JB\Dathon\IBM-Z-Datathon
.\.venv\Scripts\python.exe -m uvicorn backend.api_app:app --reload --host 127.0.0.1 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process...
INFO:     Started server process...
INFO:     Application startup complete.
```

## ✅ Test the Endpoints

### Option 1: Use Postman

1. **Import Collection**: `backend/Emissions_API.postman_collection.json`
2. **Test Endpoints**:
   - Health Check → GET `http://127.0.0.1:8000/`
   - Company Signup → POST `http://127.0.0.1:8000/signup`
   - Predict CO2 → POST `http://127.0.0.1:8000/predict`

### Option 2: Use Python Test Script

```powershell
.\.venv\Scripts\python.exe backend/test_signup.py
```

### Option 3: Use Interactive Docs

Open in browser: `http://127.0.0.1:8000/docs`

- Click on any endpoint
- Click "Try it out"
- Fill in the request body
- Click "Execute"

### Option 4: Use cURL in PowerShell

**Test Health Check:**
```powershell
curl http://127.0.0.1:8000/
```

**Test Signup:**
```powershell
$body = @{
    company_name = "Test Corp"
    email = "test@example.com"
    password = "SecurePass123!"
    location = "New York"
    business_sector = "Technology"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/signup" -Method POST -Body $body -ContentType "application/json"
```

**Test Prediction:**
```powershell
$body = @{
    sample = @{
        electricity_kwh = 1000
        diesel_litres = 50
        output_tons = 200
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://127.0.0.1:8000/predict" -Method POST -Body $body -ContentType "application/json"
```

## 📋 Complete Test Sequence

### 1. Start Server
```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.api_app:app --reload --host 127.0.0.1 --port 8000
```

### 2. Open New PowerShell Terminal

### 3. Test Health Check
```powershell
curl http://127.0.0.1:8000/
```

Expected: `{"status":"running","endpoints":{...}}`

### 4. Test Signup
```powershell
$signup = @{
    company_name = "Green Tech Industries"
    location = "San Francisco, CA"
    business_sector = "Clean Energy"
    email = "admin@greentech.com"
    telephone = "+1-555-1234"
    password = "GreenPass2024!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/signup" -Method POST -Body $signup -ContentType "application/json"
```

Expected: `{"company_id":1,"company_name":"Green Tech Industries",...,"message":"Company registered successfully"}`

### 5. Test Duplicate Email (Should Fail)
```powershell
$duplicate = @{
    company_name = "Another Company"
    email = "admin@greentech.com"  # Same email
    password = "DifferentPass123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/signup" -Method POST -Body $duplicate -ContentType "application/json"
```

Expected: `{"detail":"Email already registered"}` (400 error)

### 6. Test Prediction
```powershell
$prediction = @{
    sample = @{
        electricity_kwh = 1500
        diesel_litres = 75
        output_tons = 350
        temp_c = 24
        equipment_load_pct = 68
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://127.0.0.1:8000/predict" -Method POST -Body $prediction -ContentType "application/json"
```

Expected: `{"co2e_total_kg":2134.56}` (some numeric value)

### 7. Test Batch Prediction
```powershell
$batch = @{
    samples = @(
        @{
            electricity_kwh = 1000
            diesel_litres = 50
            output_tons = 200
        },
        @{
            electricity_kwh = 2000
            diesel_litres = 100
            output_tons = 400
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://127.0.0.1:8000/predict" -Method POST -Body $batch -ContentType "application/json"
```

Expected: `{"predictions":[{"co2e_total_kg":...},{"co2e_total_kg":...}]}`

## 🔍 Check Database

You can verify the signup data in Supabase:

1. Go to https://sgpzdpltkyisnepkkhho.supabase.co
2. Navigate to Table Editor → companies table
3. You should see the registered companies with hashed passwords

## 📱 Frontend Integration

Your frontend should make POST requests like this:

```javascript
// Signup
const signupData = {
  company_name: "My Company",
  email: "user@company.com",
  password: "MyPassword123!",
  location: "City, State",
  business_sector: "Industry",
  telephone: "+1-555-0000"
};

fetch('http://127.0.0.1:8000/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(signupData),
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));

// Predict
const predictData = {
  sample: {
    electricity_kwh: 1000,
    diesel_litres: 50,
    output_tons: 200
  }
};

fetch('http://127.0.0.1:8000/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(predictData),
})
.then(response => response.json())
.then(data => console.log('Prediction:', data))
.catch(error => console.error('Error:', error));
```

## 🐛 Troubleshooting

### Server won't start?
- Check if port 8000 is already in use: `Get-NetTCPConnection -LocalPort 8000`
- Kill the process if needed: `Stop-Process -Id <PID> -Force`

### "Model file not found" error?
- Make sure `model_development/emissions_model.joblib` exists
- Retrain if needed: `.\.venv\Scripts\python.exe model_development/train_model.py`

### "Missing SUPABASE_URL" error?
- Check that `.env` file exists in root directory
- Verify it contains SUPABASE_URL and SUPABASE_ANON_KEY

### Email validation error?
- Make sure email-validator is installed: `.\.venv\Scripts\pip.exe install email-validator`

### Database connection error?
- Verify Supabase credentials in `.env`
- Check that the companies table exists in Supabase

## 📚 Documentation Files

- `backend/API_DOCUMENTATION.md` - Complete API reference
- `backend/SYSTEM_ARCHITECTURE.md` - Architecture diagrams
- `backend/SIGNUP_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `backend/Emissions_API.postman_collection.json` - Postman collection

## 🎯 Next Steps

1. ✅ Test all endpoints using one of the methods above
2. 🔄 Integrate with your frontend
3. 🔐 For production: Add HTTPS, rate limiting, authentication
4. 📊 Monitor logs and database for registrations and predictions

---

**Need Help?** Check the documentation files or visit http://127.0.0.1:8000/docs for interactive API documentation.
