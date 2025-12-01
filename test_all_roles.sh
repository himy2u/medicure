#!/bin/bash

API_URL="http://192.168.100.91:8000"

echo "🧪 Testing WhatsApp Signup for All Roles"
echo "=========================================="
echo ""

# Test each role
ROLES=("patient" "caregiver" "doctor" "medical_staff" "ambulance_staff")
PHONE_BASE="+59398765432"

for i in "${!ROLES[@]}"; do
    ROLE="${ROLES[$i]}"
    PHONE="${PHONE_BASE}$i"
    
    echo "📱 Testing role: $ROLE"
    echo "   Phone: $PHONE"
    
    # Send OTP
    SEND_RESULT=$(curl -s -X POST "$API_URL/auth/whatsapp/send-otp" \
      -H "Content-Type: application/json" \
      -d "{\"phone_number\": \"$PHONE\", \"role\": \"$ROLE\"}")
    
    if echo "$SEND_RESULT" | grep -q '"success":true'; then
        echo "   ✅ OTP sent"
        
        # Get OTP from logs
        sleep 1
        OTP=$(tail -10 backend/backend.log | grep "✓ OTP sent to $PHONE" | tail -1 | grep -o '[0-9]\{6\}')
        
        if [ -n "$OTP" ]; then
            echo "   🔐 OTP: $OTP"
            
            # Verify OTP
            VERIFY_RESULT=$(curl -s -X POST "$API_URL/auth/whatsapp/verify-otp" \
              -H "Content-Type: application/json" \
              -d "{\"phone_number\": \"$PHONE\", \"otp\": \"$OTP\", \"role\": \"$ROLE\", \"name\": \"Test $ROLE\"}")
            
            if echo "$VERIFY_RESULT" | grep -q '"access_token"'; then
                USER_ID=$(echo "$VERIFY_RESULT" | grep -o '"user_id":"[^"]*"' | cut -d'"' -f4)
                echo "   ✅ Signup successful! User ID: $USER_ID"
            else
                echo "   ❌ Verification failed"
                echo "   $VERIFY_RESULT"
            fi
        else
            echo "   ⚠️  Could not extract OTP from logs"
        fi
    else
        echo "   ❌ Failed to send OTP"
        echo "   $SEND_RESULT"
    fi
    
    echo ""
done

echo "=========================================="
echo "✅ All role tests complete!"
