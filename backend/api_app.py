from typing import List, Dict, Any, Optional
import json
from pathlib import Path
import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
import pandas as pd
import numpy as np
import joblib
from dotenv import load_dotenv
from supabase import create_client, Client
from passlib.context import CryptContext

# Load environment variables
load_dotenv()

# Initialize password hashing with explicit bcrypt configuration
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    bcrypt__rounds=12
)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / 'model_development' / 'model_manifest.json'
MODEL_PATH = ROOT / 'model_development' / 'emissions_model.joblib'


app = FastAPI(title='Emissions Model API')
# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080", "http://127.0.0.1:8080",  # company app
        "http://localhost:8081", "http://127.0.0.1:8081",  # communities app
        "http://localhost:5173", "http://127.0.0.1:5173"   # vite dev fallback
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Pydantic models for request validation
class CompanySignup(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    business_sector: Optional[str] = Field(None, max_length=255)
    email: EmailStr
    telephone: Optional[str] = Field(None, max_length=50)
    password: str = Field(..., description="Password for company account")

class CompanyResponse(BaseModel):
    company_id: int
    company_name: str
    location: Optional[str]
    business_sector: Optional[str]
    email: str
    telephone: Optional[str]
    message: str


class CompanyLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., description="Password for company account")

# For history endpoint
class EmissionHistoryItem(BaseModel):
    emission_id: int
    company_id: int
    values: str
    recorded_at: str

class LoginResponse(BaseModel):
    company_id: int
    company_name: str
    email: str
    message: str
    token: Optional[str] = None  # For future JWT implementation

# ---------------- Community users (communities_users table) ---------------- #

class CommunitySignup(BaseModel):
    user_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    telephone: Optional[str] = Field(None, max_length=50)
    language_choice: Optional[str] = Field(None, max_length=50)
    password: str = Field(..., description="Password for community account")

class CommunityLogin(BaseModel):
    email: EmailStr
    password: str

class CommunityLoginResponse(BaseModel):
    user_id: int
    user_name: str
    email: str
    language_choice: Optional[str] = None
    message: str

# Load manifest
manifest = {}
try:
    with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    MODEL_FEATURES: List[str] = manifest.get('features', [])
except Exception:
    MODEL_FEATURES = []

# Load model
model = None
if MODEL_PATH.exists():
    try:
        pack = joblib.load(MODEL_PATH)
        model = pack['model'] if isinstance(pack, dict) and 'model' in pack else pack
    except Exception:
        model = None


@app.get('/')
def root():
    """API Health Check"""
    return {
        'status': 'running',
        'endpoints': {
            'POST /signup': 'Register a new company',
            'POST /login': 'Authenticate a company',
            'POST /community/signup': 'Register a new community user',
            'POST /community/login': 'Authenticate a community user',
            'POST /predict': 'Predict CO2 emissions'
        }
    }


@app.post('/signup', response_model=CompanyResponse, status_code=201)
def signup(company: CompanySignup):
    """
    Register a new company account
    """
    try:
        # Basic password validation
        if len(company.password) < 8:
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 8 characters long"
            )
        
        # Truncate password to 72 bytes for bcrypt compatibility
        # This ensures long passwords are accepted but only first 72 chars are used
        password_to_hash = company.password[:72]
        
        # Hash the password using SHA256 (more reliable)
        import hashlib
        password_to_hash = company.password[:72]  # Truncate for consistency
        hashed_password = hashlib.sha256(password_to_hash.encode()).hexdigest()
        
        # Prepare data for insertion
        company_data = {
            'company_name': company.company_name,
            'location': company.location,
            'business_sector': company.business_sector,
            'email': company.email,
            'telephone': company.telephone,
            'password': hashed_password
        }
        
        # Insert into Supabase
        response = supabase.table('companies').insert(company_data).execute()
        
        # Check if insertion was successful
        if not response.data:
            raise HTTPException(
                status_code=500, 
                detail="Failed to create company account"
            )
        
        # Get the inserted company data
        inserted_company = response.data[0]
        
        return CompanyResponse(
            company_id=inserted_company['company_id'],
            company_name=inserted_company['company_name'],
            location=inserted_company['location'],
            business_sector=inserted_company['business_sector'],
            email=inserted_company['email'],
            telephone=inserted_company['telephone'],
            message="Company registered successfully"
        )
        
    except HTTPException:
        # Re-raise HTTPExceptions (like validation errors)
        raise
    except Exception as e:
        # Handle unique constraint violation (duplicate email)
        if "duplicate key value" in str(e).lower() or "unique" in str(e).lower():
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        # Handle other errors
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )


@app.post('/community/signup', status_code=201)
def community_signup(user: CommunitySignup):
    """
    Register a new community user (communities_users table)
    """
    try:
        if len(user.password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

        # Truncate for bcrypt compatibility then hash (SHA256 for consistency with company approach)
        import hashlib
        password_to_hash = user.password[:72]
        hashed_password = hashlib.sha256(password_to_hash.encode()).hexdigest()

        insert_data = {
            'user_name': user.user_name,
            'email': user.email,
            'telephone': user.telephone,
            'language_choice': user.language_choice,
            'password': hashed_password
        }

        resp = supabase.table('communities_users').insert(insert_data).execute()
        if not resp.data:
            raise HTTPException(status_code=500, detail="Failed to create community user")

        row = resp.data[0]
        return {
            'user_id': row['user_id'],
            'user_name': row['user_name'],
            'email': row['email'],
            'language_choice': row.get('language_choice'),
            'message': 'User registered successfully'
        }
    except HTTPException:
        raise
    except Exception as e:
        if "duplicate key value" in str(e).lower() or "unique" in str(e).lower():
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=500, detail=f"Community registration failed: {e}")


@app.post('/login', response_model=LoginResponse, status_code=200)
def login(login_data: CompanyLogin):
    """
    Authenticate a company using email and password
    """
    try:
        # Query the database for the company with the given email
        response = supabase.table('companies').select('*').eq('email', login_data.email).execute()
        
        # Check if company exists
        if not response.data:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        company = response.data[0]
        
        # Verify the password - handle both bcrypt and SHA256 hashes
        password_valid = False
        try:
            # First try bcrypt verification
            password_valid = pwd_context.verify(login_data.password, company['password'])
        except Exception:
            # If bcrypt fails, try SHA256 verification
            import hashlib
            sha256_hash = hashlib.sha256(login_data.password.encode()).hexdigest()
            password_valid = (sha256_hash == company['password'])
        
        if not password_valid:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Return successful login response
        return LoginResponse(
            company_id=company['company_id'],
            company_name=company['company_name'],
            email=company['email'],
            message="Login successful"
        )
        
    except HTTPException:
        # Re-raise HTTPExceptions (like authentication errors)
        raise
    except Exception as e:
        # Handle other errors
        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        )


from datetime import datetime

@app.post('/community/login', response_model=CommunityLoginResponse, status_code=200)
def community_login(login_data: CommunityLogin):
    """
    Authenticate a community user using email and password against communities_users table
    """
    try:
        resp = supabase.table('communities_users').select('*').eq('email', login_data.email).execute()
        if not resp.data:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user = resp.data[0]

        # Verify password: try bcrypt, fallback to SHA256
        password_valid = False
        try:
            password_valid = pwd_context.verify(login_data.password, user['password'])
        except Exception:
            import hashlib
            sha256_hash = hashlib.sha256(login_data.password.encode()).hexdigest()
            password_valid = (sha256_hash == user['password'])

        if not password_valid:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        return CommunityLoginResponse(
            user_id=user['user_id'],
            user_name=user['user_name'],
            email=user['email'],
            language_choice=user.get('language_choice'),
            message="Login successful"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Community login failed: {e}")

@app.post('/predict')
def predict(payload: Dict[str, Any]):
    print("/predict called. Payload:", payload, flush=True)
    # Accept either {"sample": {...}} or {"samples": [{...}, {...}]}

    # Extract company_id if present (for now, expect in payload)
    company_id = payload.get('company_id')
    if not company_id:
        raise HTTPException(status_code=400, detail='company_id is required in payload')

    if 'sample' in payload:
        samples = [payload['sample']]
    elif 'samples' in payload:
        samples = payload['samples']
    else:
        print("Missing 'sample' or 'samples' in payload", flush=True)
        raise HTTPException(status_code=400, detail='Request must contain "sample" or "samples"')

    if not MODEL_FEATURES:
        print("MODEL_FEATURES not available", flush=True)
        raise HTTPException(status_code=500, detail='Model feature list not available')

    if model is None:
        print(f"Model file not found at {MODEL_PATH}", flush=True)
        raise HTTPException(status_code=503, detail=f'Model file not found at {MODEL_PATH}')

    # Build DataFrame with only manifest features, fill missing with 0
    rows = []
    for s in samples:
        row = {c: s.get(c, 0) for c in MODEL_FEATURES}
        rows.append(row)

    df = pd.DataFrame(rows, columns=MODEL_FEATURES)
    print("Prediction DataFrame:\n", df, flush=True)
    df = df.replace([np.inf, -np.inf], np.nan).fillna(0)

    try:
        preds = model.predict(df)
        print("Prediction output:", preds, flush=True)
    except Exception as e:
        print("Prediction failed:", e, flush=True)
        raise HTTPException(status_code=500, detail=f'Prediction failed: {e}')

    # Store each prediction in emission table
    results = []
    now_str = datetime.utcnow().isoformat()
    for i, sample in enumerate(samples):
        pred_val = float(preds[i])
        # Store all input values and prediction in 'values' as JSON
        record = {
            'input': sample,
            'prediction': pred_val
        }
        try:
            insert_data = {
                'company_id': company_id,
                'values': json.dumps(record),
                'recorded_at': now_str
            }
            resp = supabase.table('emissions').insert(insert_data).execute()
            emission_id = resp.data[0]['emission_id'] if resp.data else None
        except Exception as e:
            print("Failed to insert emissions record:", e, flush=True)
            emission_id = None
        results.append({
            'input': sample,
            'prediction': pred_val,
            'emission_id': emission_id,
            'recorded_at': now_str
        })

    # Return predictions
    if len(results) == 1:
        return {'co2e_total_kg': results[0]['prediction'], 'emission_id': results[0]['emission_id'], 'recorded_at': results[0]['recorded_at']}
    else:
        return {'predictions': results}


# New endpoint: get prediction history for a company
@app.get('/history', response_model=List[EmissionHistoryItem])
def get_history(company_id: int):
    try:
        resp = supabase.table('emissions').select('*').eq('company_id', company_id).order('recorded_at', desc=True).execute()
        if not resp.data:
            return []
        return resp.data
    except Exception as e:
        print("Failed to fetch emissions history:", e, flush=True)
        raise HTTPException(status_code=500, detail=f'Failed to fetch emissions history: {e}')
