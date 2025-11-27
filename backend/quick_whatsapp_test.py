"""
Quick WhatsApp Test - Run with: .venv/bin/python quick_whatsapp_test.py
"""

import requests
import json

print("\n" + "="*60)
print("WhatsApp Cloud API Quick Test")
print("="*60 + "\n")

# Get credentials
phone_id = input("Enter Phone Number ID: ").strip()
access_token = input("Enter Access Token: ").strip()
your_phone = input("Enter your WhatsApp number (+country code): ").strip()

print("\n1. Testing API Connection...")
url = f"https://graph.facebook.com/v18.0/{phone_id}"
headers = {"Authorization": f"Bearer {access_token}"}

try:
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Connected!")
        print(f"   📱 Phone: {data.get('display_phone_number')}")
    else:
        print(f"   ❌ Error: {response.status_code}")
        print(f"   {response.text}")
        exit(1)
except Exception as e:
    print(f"   ❌ Failed: {e}")
    exit(1)

print("\n2. Sending Test Message...")
message_url = f"https://graph.facebook.com/v18.0/{phone_id}/messages"
payload = {
    "messaging_product": "whatsapp",
    "to": your_phone,
    "type": "text",
    "text": {"body": "Hello from Medicure! Reply 'Hi' to open 24hr window."}
}

try:
    response = requests.post(message_url, headers=headers, json=payload)
    if response.status_code == 200:
        print(f"   ✅ Message sent! Check your WhatsApp")
    else:
        print(f"   ⚠️  Status: {response.status_code}")
        print(f"   {response.text}")
except Exception as e:
    print(f"   ❌ Failed: {e}")

print("\n3. Creating .env file...")
env_content = f"""WHATSAPP_PHONE_ID={phone_id}
WHATSAPP_ACCESS_TOKEN={access_token}
WHATSAPP_TEMPLATE_NAME=otp_verification
WHATSAPP_WEBHOOK_VERIFY_TOKEN=medicure_webhook_token_2025
"""

with open('.env', 'w') as f:
    f.write(env_content)

print("   ✅ .env file created!")

print("\n" + "="*60)
print("✅ Setup Complete!")
print("="*60)
print("\nNext Steps:")
print("1. Reply to the message on WhatsApp (opens 24hr window)")
print("2. Run: .venv/bin/python test_whatsapp_otp.py")
print("3. Test from mobile app\n")
