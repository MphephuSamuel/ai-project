"""
Test script for the signup endpoint
Run this to test company registration
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_signup():
    """Test the signup endpoint"""
    
    # Test data for a new company
    company_data = {
        "company_name": "Green Energy Corp",
        "location": "San Francisco, CA",
        "business_sector": "Renewable Energy",
        "email": "info@greenenergy.com",
        "telephone": "+1-555-0123",
        "password": "SecurePass123!"
    }
    
    print("Testing signup endpoint...")
    print(f"Data: {json.dumps(company_data, indent=2)}\n")
    
    try:
        response = requests.post(f"{BASE_URL}/signup", json=company_data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("\n✅ Signup successful!")
        elif response.status_code == 400:
            print("\n⚠️ Email already registered or validation error")
        else:
            print(f"\n❌ Signup failed with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the server")
        print("Make sure the server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_duplicate_signup():
    """Test signup with duplicate email"""
    print("\n" + "="*60)
    print("Testing duplicate email...")
    
    company_data = {
        "company_name": "Another Company",
        "email": "info@greenenergy.com",  # Same email as first test
        "password": "AnotherPass456!"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/signup", json=company_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 400:
            print("\n✅ Duplicate detection working correctly!")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("="*60)
    print("Company Signup API Test")
    print("="*60 + "\n")
    
    test_signup()
    test_duplicate_signup()
    
    print("\n" + "="*60)
    print("Testing complete!")
    print("="*60)
