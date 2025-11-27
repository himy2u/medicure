"""
WhatsApp Cloud API Setup and Test Script
No account verification needed - just test with credentials
"""

import sys
try:
    import httpx
except ImportError:
    print("Installing httpx...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "httpx"])
    import httpx

import asyncio
import json

async def test_whatsapp_api(phone_id: str, access_token: str, test_phone: str):
    """Test WhatsApp Cloud API connection and send test message"""
    
    print("=" * 60)
    print("WhatsApp Cloud API Setup Test")
    print("=" * 60)
    
    # Step 1: Verify API access
    print("\n1. Testing API Connection...")
    url = f"https://graph.facebook.com/v18.0/{phone_id}"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ API Connected!")
                print(f"   📱 Phone: {data.get('display_phone_number', 'N/A')}")
                print(f"   ✅ Verified: {data.get('verified_name', 'N/A')}")
            else:
                print(f"   ❌ API Error: {response.status_code}")
                print(f"   {response.text}")
                return False
    except Exception as e:
        print(f"   ❌ Connection failed: {str(e)}")
        return False
    
    # Step 2: Send test message (simple text, no template needed)
    print("\n2. Sending Test Message...")
    print(f"   📤 To: {test_phone}")
    
    message_url = f"https://graph.facebook.com/v18.0/{phone_id}/messages"
    
    # Simple text message (works without template approval)
    payload = {
        "messaging_product": "whatsapp",
        "to": test_phone,
        "type": "text",
        "text": {
            "body": "Hello from Medicure! This is a test message. Reply 'Hi' to confirm."
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                message_url,
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Message sent!")
                print(f"   📱 Check your WhatsApp")
                print(f"   Message ID: {result.get('messages', [{}])[0].get('id', 'N/A')}")
                return True
            else:
                print(f"   ❌ Send failed: {response.status_code}")
                print(f"   {response.text}")
                
                # Check if it's a template issue
                if "template" in response.text.lower():
                    print("\n   💡 Template not approved yet. That's OK!")
                    print("   💡 For now, you can:")
                    print("      1. Reply to the test number on WhatsApp")
                    print("      2. Then send messages will work (24hr window)")
                
                return False
    except Exception as e:
        print(f"   ❌ Send failed: {str(e)}")
        return False

async def setup_env_file(phone_id: str, access_token: str):
    """Create .env file with credentials"""
    
    env_content = f"""# WhatsApp Cloud API Configuration
WHATSAPP_PHONE_ID={phone_id}
WHATSAPP_ACCESS_TOKEN={access_token}
WHATSAPP_TEMPLATE_NAME=otp_verification
WHATSAPP_WEBHOOK_VERIFY_TOKEN=medicure_webhook_token_2025

# JWT Configuration (keep existing or add these)
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("\n✅ .env file created!")
    print("   Location: backend/.env")

async def main():
    """Main setup flow"""
    
    print("\n🚀 WhatsApp Cloud API Setup\n")
    print("You need 3 things from Meta for Developers:")
    print("1. Phone Number ID")
    print("2. Access Token (temporary or permanent)")
    print("3. Your WhatsApp number (to receive test)")
    print("\nGet them from: https://developers.facebook.com/apps")
    print("Your App → WhatsApp → API Setup\n")
    
    # Get credentials
    phone_id = input("Enter Phone Number ID: ").strip()
    access_token = input("Enter Access Token: ").strip()
    test_phone = input("Enter your WhatsApp number (with country code, e.g., +1234567890): ").strip()
    
    if not phone_id or not access_token or not test_phone:
        print("\n❌ All fields are required!")
        return
    
    # Test API
    success = await test_whatsapp_api(phone_id, access_token, test_phone)
    
    if success:
        # Create .env file
        create_env = input("\n📝 Create .env file with these credentials? (y/n): ").strip().lower()
        if create_env == 'y':
            await setup_env_file(phone_id, access_token)
    
    print("\n" + "=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    
    if success:
        print("\n✅ WhatsApp API is working!")
        print("\n📝 Next Steps:")
        print("   1. Check your WhatsApp for the test message")
        print("   2. Reply to the message (opens 24hr window)")
        print("   3. Run: python test_whatsapp_otp.py")
        print("   4. Test from mobile app")
    else:
        print("\n⚠️  API connection works but message failed")
        print("\n💡 This is normal if:")
        print("   - Template not approved yet")
        print("   - Phone number not verified")
        print("\n📝 To fix:")
        print("   1. Wait for template approval (5-30 min)")
        print("   2. Or reply to test number first")
        print("   3. Then try again")
    
    print("\n")

if __name__ == "__main__":
    asyncio.run(main())
