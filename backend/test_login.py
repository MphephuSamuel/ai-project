#!/usr/bin/env python3
"""
Test script for the login endpoint
"""

import requests
import json

# Test login endpoint
def test_login():
    url = "http://127.0.0.1:8000/login"
    
    # Test data - replace with actual credentials from your signup
    login_data = {
        "email": "test@company.com",
        "password": "testpassword123"
    }
    
    try:
        print("Testing login endpoint...")
        print(f"URL: {url}")
        print(f"Data: {json.dumps(login_data, indent=2)}")
        print("-" * 50)
        
        response = requests.post(url, json=login_data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
        else:
            print("❌ Login failed!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_login()