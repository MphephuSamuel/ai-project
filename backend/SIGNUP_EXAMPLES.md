# Signup Request Examples

## ✅ Valid Signup Request

```json
{
  "company_name": "Green Energy Corp",
  "email": "info@greenenergy.com",
  "password": "SecurePass123!",
  "location": "San Francisco, CA",
  "business_sector": "Renewable Energy",
  "telephone": "+1-555-0123"
}
```

**Required Fields:**
- `company_name` ✅ Required (1-255 characters)
- `email` ✅ Required (valid email format)
- `password` ✅ Required (minimum 8 characters, no maximum)

**Optional Fields:**
- `location` (max 255 characters)
- `business_sector` (max 255 characters)
- `telephone` (max 50 characters)

---

## ❌ Common Validation Errors

### 1. Password Too Short (< 8 characters)
```json
{
  "company_name": "Test Corp",
  "email": "test@example.com",
  "password": "Short1!"  ❌ Only 7 characters
}
```
**Error:** `String should have at least 8 characters`

**Fix:** Use at least 8 characters
```json
{
  "password": "Short123!"  ✅ 9 characters
}
```

---

### 2. Invalid Email Format
```json
{
  "company_name": "Test Corp",
  "email": "notanemail",  ❌ Missing @ and domain
  "password": "ValidPass123!"
}
```
**Error:** `value is not a valid email address`

**Fix:** Use valid email format
```json
{
  "email": "valid@example.com"  ✅
}
```

---

### 3. Missing Required Fields
```json
{
  "location": "New York"  ❌ Missing company_name, email, password
}
```
**Error:** `Field required`

**Fix:** Include all required fields
```json
{
  "company_name": "Test Corp",  ✅
  "email": "test@example.com",  ✅
  "password": "ValidPass123!"   ✅
}
```

---

## 📝 Minimal Valid Request

```json
{
  "company_name": "My Company",
  "email": "user@example.com",
  "password": "Password123!"
}
```

This is the absolute minimum - just the 3 required fields.

---

## 🎯 Test in Postman

### Setup:
1. **Method:** POST
2. **URL:** `http://127.0.0.1:8000/signup`
3. **Headers:** 
   - `Content-Type: application/json`
4. **Body:** (raw JSON)

### Try This Valid Example:
```json
{
  "company_name": "EcoTech Solutions",
  "email": "contact@ecotech.com",
  "password": "EcoSecure2024!",
  "location": "Berlin, Germany",
  "business_sector": "Green Technology",
  "telephone": "+49-30-12345678"
}
```

### Expected Response (201 Created):
```json
{
  "company_id": 1,
  "company_name": "EcoTech Solutions",
  "location": "Berlin, Germany",
  "business_sector": "Green Technology",
  "email": "contact@ecotech.com",
  "telephone": "+49-30-12345678",
  "message": "Company registered successfully"
}
```

---

## 🔍 Validation Rules Summary

| Field | Required | Min Length | Max Length | Format |
|-------|----------|------------|------------|--------|
| company_name | ✅ Yes | 1 | 255 | Any text |
| email | ✅ Yes | - | 255 | Valid email |
| password | ✅ Yes | 8 | None | Any text (auto-truncated to 72 for hashing) |
| location | ❌ No | - | 255 | Any text |
| business_sector | ❌ No | - | 255 | Any text |
| telephone | ❌ No | - | 50 | Any text |

---

## 🐛 Debugging Tips

### If you get 422 Unprocessable Content:

1. **Check the response body** - it tells you exactly what's wrong:
```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "password"],
      "msg": "String should have at least 8 characters",
      "input": "Short1!",
      "ctx": {"min_length": 8}
    }
  ]
}
```

2. **Common issues:**
   - Password < 8 characters
   - Password > 72 characters
   - Invalid email format
   - Missing required fields
   - Extra commas in JSON

3. **Verify your JSON is valid:**
   - Use a JSON validator like jsonlint.com
   - Check for trailing commas
   - Ensure all strings are in quotes

---

## ✅ Quick Test Commands

### PowerShell:
```powershell
$body = @{
    company_name = "Test Company"
    email = "test@example.com"
    password = "TestPass123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/signup" -Method POST -Body $body -ContentType "application/json"
```

### cURL (Git Bash):
```bash
curl -X POST http://127.0.0.1:8000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Company",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

---

## 🎉 Success Indicators

### ✅ Everything Working:
- Status Code: **201 Created**
- Response includes `company_id`
- Response includes `"message": "Company registered successfully"`

### ❌ Validation Error:
- Status Code: **422 Unprocessable Content**
- Response shows validation details

### ❌ Duplicate Email:
- Status Code: **400 Bad Request**
- Response: `"detail": "Email already registered"`

### ❌ Server Error:
- Status Code: **500 Internal Server Error**
- Check server logs for details
