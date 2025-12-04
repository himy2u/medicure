#!/bin/bash

echo "🔍 Verifying All Authentication Fixes"
echo "======================================"
echo ""

PASS=0
FAIL=0

# Check 1: Auth hook exists
if [ -f "frontend/hooks/useAuthCheck.ts" ]; then
    echo "✅ Auth hook exists"
    ((PASS++))
else
    echo "❌ Auth hook missing"
    ((FAIL++))
fi

# Check 2: All home screens have auth
AUTH_COUNT=$(grep -l "useAuthCheck" frontend/screens/*HomeScreen.tsx 2>/dev/null | wc -l | tr -d ' ')
if [ "$AUTH_COUNT" -eq "6" ]; then
    echo "✅ All 6 home screens have auth checks"
    ((PASS++))
else
    echo "❌ Only $AUTH_COUNT/6 home screens have auth checks"
    ((FAIL++))
fi

# Check 3: WhatsApp uses phone_number
if grep -q "phone_number: phoneNumber" frontend/screens/MedicalStaffSignupScreen.tsx; then
    echo "✅ MedicalStaffSignupScreen uses phone_number"
    ((PASS++))
else
    echo "❌ MedicalStaffSignupScreen still uses wrong field"
    ((FAIL++))
fi

# Check 4: SignupScreen uses phone_number
if grep -q "phone_number: phoneNumber" frontend/screens/SignupScreen.tsx; then
    echo "✅ SignupScreen uses phone_number"
    ((PASS++))
else
    echo "❌ SignupScreen uses wrong field"
    ((FAIL++))
fi

# Check 5: Google Sign-In properly imported
if grep -q "import { GoogleSignin }" frontend/screens/SignupScreen.tsx; then
    echo "✅ SignupScreen has GoogleSignin import"
    ((PASS++))
else
    echo "❌ SignupScreen missing GoogleSignin import"
    ((FAIL++))
fi

if grep -q "import { GoogleSignin }" frontend/screens/MedicalStaffSignupScreen.tsx; then
    echo "✅ MedicalStaffSignupScreen has GoogleSignin import"
    ((PASS++))
else
    echo "❌ MedicalStaffSignupScreen missing GoogleSignin import"
    ((FAIL++))
fi

# Check 6: ProfileHeader shows Guest
if grep -q "Guest" frontend/components/ProfileHeader.tsx; then
    echo "✅ ProfileHeader shows Guest status"
    ((PASS++))
else
    echo "❌ ProfileHeader doesn't show Guest"
    ((FAIL++))
fi

echo ""
echo "======================================"
echo "Results: $PASS passed, $FAIL failed"
echo "======================================"

if [ $FAIL -eq 0 ]; then
    echo "🎉 All checks passed!"
    exit 0
else
    echo "⚠️  Some checks failed"
    exit 1
fi
