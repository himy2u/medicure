"""
Test script for WhatsApp OTP functionality
Run this to verify your setup is working correctly
"""

import asyncio
import os
from whatsapp_otp import whatsapp_service

async def test_whatsapp_setup():
    """Test WhatsApp OTP setup"""
    print("=" * 60)
    print("WhatsApp OTP Setup Test")
    print("=" * 60)
    
    # Check environment variables
    print("\n1. Checking Environment Variables...")
    phone_id = os.getenv("WHATSAPP_PHONE_ID")
    access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
    template_name = os.getenv("WHATSAPP_TEMPLATE_NAME", "otp_verification")
    
    if not phone_id:
        print("   ❌ WHATSAPP_PHONE_ID not set")
        return False
    else:
        print(f"   ✅ WHATSAPP_PHONE_ID: {phone_id[:10]}...")
    
    if not access_token:
        print("   ❌ WHATSAPP_ACCESS_TOKEN not set")
        return False
    else:
        print(f"   ✅ WHATSAPP_ACCESS_TOKEN: {access_token[:20]}...")
    
    print(f"   ✅ WHATSAPP_TEMPLATE_NAME: {template_name}")
    
    # Test OTP generation
    print("\n2. Testing OTP Generation...")
    otp = whatsapp_service.generate_otp()
    print(f"   ✅ Generated OTP: {otp}")
    
    # Test OTP storage
    print("\n3. Testing OTP Storage...")
    test_phone = "+1234567890"
    whatsapp_service.store_otp(test_phone, otp, is_fep=True)
    print(f"   ✅ OTP stored for {test_phone}")
    
    # Test OTP validation
    print("\n4. Testing OTP Validation...")
    validation = whatsapp_service.validate_otp(test_phone, otp)
    if validation.get("valid"):
        print(f"   ✅ OTP validation successful")
    else:
        print(f"   ❌ OTP validation failed: {validation.get('error')}")
    
    # Test rate limiting
    print("\n5. Testing Rate Limiting...")
    can_send = whatsapp_service.check_rate_limit(test_phone)
    print(f"   ✅ Rate limit check: {'Allowed' if can_send else 'Blocked'}")
    
    # Test sending OTP (requires valid credentials)
    print("\n6. Testing OTP Sending...")
    print("   ⚠️  This will attempt to send a real WhatsApp message")
    
    test_number = input("   Enter your WhatsApp number (with country code, e.g., +1234567890) or press Enter to skip: ").strip()
    
    if test_number:
        print(f"   📤 Sending OTP to {test_number}...")
        result = await whatsapp_service.send_otp(test_number, is_new_user=True)
        
        if result.get("success"):
            print(f"   ✅ OTP sent successfully!")
            print(f"   💰 Cost: {result.get('cost', 'PAID')}")
            print(f"   📱 Check your WhatsApp for the message")
            
            # Verify OTP
            received_otp = input("   Enter the OTP you received: ").strip()
            if received_otp:
                validation = whatsapp_service.validate_otp(test_number, received_otp)
                if validation.get("valid"):
                    print(f"   ✅ OTP verified successfully!")
                    print(f"   🎉 WhatsApp OTP is fully functional!")
                else:
                    print(f"   ❌ OTP verification failed: {validation.get('error')}")
        else:
            print(f"   ❌ Failed to send OTP: {result.get('error')}")
            print(f"   💡 Check your credentials and template approval status")
    else:
        print("   ⏭️  Skipped OTP sending test")
    
    print("\n" + "=" * 60)
    print("Test Complete!")
    print("=" * 60)
    
    return True

async def test_api_connection():
    """Test connection to WhatsApp API"""
    print("\n7. Testing API Connection...")
    
    import httpx
    
    phone_id = os.getenv("WHATSAPP_PHONE_ID")
    access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
    
    if not phone_id or not access_token:
        print("   ❌ Missing credentials")
        return False
    
    url = f"https://graph.facebook.com/v18.0/{phone_id}"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ API connection successful")
                print(f"   📱 Phone: {data.get('display_phone_number', 'N/A')}")
                print(f"   🆔 ID: {data.get('id', 'N/A')}")
                return True
            else:
                print(f"   ❌ API connection failed: {response.status_code}")
                print(f"   Error: {response.text}")
                return False
    except Exception as e:
        print(f"   ❌ Connection error: {str(e)}")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting WhatsApp OTP Test Suite...\n")
    
    # Run tests
    asyncio.run(test_whatsapp_setup())
    asyncio.run(test_api_connection())
    
    print("\n📝 Next Steps:")
    print("   1. If tests passed: Your WhatsApp OTP is ready!")
    print("   2. If tests failed: Check WHATSAPP_SETUP_WALKTHROUGH.md")
    print("   3. Ensure template is approved in Meta Business Suite")
    print("   4. Test from the mobile app")
    print("\n")
