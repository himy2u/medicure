#!/bin/bash

# Complete WhatsApp signup test
PHONE="+593998118039"
API_URL="http://192.168.100.91:8000"

echo "=== STEP 1: Send OTP ==="
SEND_RESULT=$(curl -s -X POST "$API_URL/auth/whatsapp/send-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone_number\": \"$PHONE\", \"role\": \"patient\"}")

echo "$SEND_RESULT"

# Extract OTP from backend logs
sleep 2
OTP=$(tail -20 backend/backend.log | grep "✓ OTP sent to $PHONE" | tail -1 | grep -o '[0-9]\{6\}' | tail -1)

echo ""
echo "=== STEP 2: Verify OTP ==="
echo "OTP: $OTP"

VERIFY_RESULT=$(curl -s -X POST "$API_URL/auth/whatsapp/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"phone_number\": \"$PHONE\", \"otp\": \"$OTP\", \"role\": \"patient\", \"name\": \"Test User\"}")

echo "$VERIFY_RESULT"

# Check if we got a token
if echo "$VERIFY_RESULT" | grep -q "access_token"; then
    echo ""
    echo "✅ Backend WhatsApp signup flow works!"
    echo ""
    echo "What user sees in app:"
    echo "1. Click 'Send OTP' → Success alert"
    echo "2. Screen changes to OTP input"
    echo "3. Enter OTP → Verify"
    echo "4. Navigate to profile completion screen"
else
    echo ""
    echo "❌ Verification failed"
fi
