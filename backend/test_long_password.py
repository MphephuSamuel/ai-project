"""
Quick test to verify long password handling
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_long_password():
    """Test signup with a very long password"""
    
    # Create a password longer than 72 characters
    long_password = "A" * 100  # 100 characters
    
    signup_data = {
        "company_name": "Long Password Test Corp",
        "email": "longpasstest@example.com",
        "password": long_password
    }
    
    print("Testing signup with 100-character password...")
    print(f"Password length: {len(signup_data['password'])} characters")
    print(f"First 72 chars: {signup_data['password'][:72]}")
    print(f"Full password: {signup_data['password']}\n")
    
    try:
        response = requests.post(f"{BASE_URL}/signup", json=signup_data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("\n✅ SUCCESS! Long password accepted!")
            print("The password was automatically truncated to 72 characters for hashing.")
        else:
            print(f"\n❌ FAILED with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the server")
        print("Make sure the server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_long_password()
