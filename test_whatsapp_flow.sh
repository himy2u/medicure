#!/bin/bash

# Test WhatsApp OTP Flow
# This script tests the complete WhatsApp signup flow

API_URL="http://192.168.100.91:8000"
PHONE="+593987654321"

echo "🧪 Testing WhatsApp OTP Flow"
echo "=============================="
echo ""

# Step 1: Send OTP
echo "📱 Step 1: Sending OTP to $PHONE"
SEND_RESPONSE=$(curl -s -X POST "$API_URL/auth/whatsapp/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone_number\": \"$PHONE\", \"role\": \"patient\"}")

echo "Response: $SEND_RESPONSE"
echo ""

# Check if OTP was sent successfully
if echo "$SEND_RESPONSE" | grep -q '"success":true'; then
  echo "✅ OTP sent successfully!"
  echo ""
  
  # Extract OTP from response (for testing only - remove in production)
  OTP=$(echo "$SEND_RESPONSE" | grep -o '"otp":"[^"]*"' | cut -d'"' -f4)
  
  if [ -n "$OTP" ]; then
    echo "🔐 OTP Code: $OTP"
    echo ""
    
    # Step 2: Verify OTP
    echo "📱 Step 2: Verifying OTP"
    VERIFY_RESPONSE=$(curl -s -X POST "$API_URL/auth/whatsapp/verify-otp" \
      -H "Content-Type: application/json" \
      -d "{\"phone_number\": \"$PHONE\", \"otp\": \"$OTP\", \"role\": \"patient\", \"name\": \"Test User\"}")
    
    echo "Response: $VERIFY_RESPONSE"
    echo ""
    
    if echo "$VERIFY_RESPONSE" | grep -q '"access_token"'; then
      echo "✅ Verification successful!"
      echo "✅ WhatsApp flow is working correctly!"
    else
      echo "❌ Verification failed"
    fi
  else
    echo "⚠️  OTP not found in response (this is normal in production)"
  fi
else
  echo "❌ Failed to send OTP"
  echo "Error: $SEND_RESPONSE"
fi

echo ""
echo "=============================="
echo "Test complete"
