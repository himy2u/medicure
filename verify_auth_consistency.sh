#!/bin/bash

# Verify Authentication Consistency Across All Screens
# Run this before claiming any auth work is "done"

set -e

echo "🔍 Verifying Authentication Consistency..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Function to check if a pattern exists in a file
check_pattern() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$file"; then
        echo -e "${GREEN}✅${NC} $description"
        return 0
    else
        echo -e "${RED}❌${NC} $description"
        ((ERRORS++))
        return 1
    fi
}

# Function to check if a pattern does NOT exist in a file
check_not_pattern() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if ! grep -q "$pattern" "$file"; then
        echo -e "${GREEN}✅${NC} $description"
        return 0
    else
        echo -e "${RED}❌${NC} $description"
        ((ERRORS++))
        return 1
    fi
}

echo "📋 Checking SignupScreen.tsx..."
check_pattern "frontend/screens/SignupScreen.tsx" "import { GoogleSignin }" "GoogleSignin imported"
check_pattern "frontend/screens/SignupScreen.tsx" "phone_number: phoneNumber" "Uses phone_number field"
check_pattern "frontend/screens/SignupScreen.tsx" "ProfileHeader" "Has ProfileHeader"
check_not_pattern "frontend/screens/SignupScreen.tsx" "const GoogleSignin: any = null" "GoogleSignin not set to null"
check_not_pattern "frontend/screens/SignupScreen.tsx" "Alert.prompt" "No Alert.prompt usage"
echo ""

echo "📋 Checking MedicalStaffSignupScreen.tsx..."
check_pattern "frontend/screens/MedicalStaffSignupScreen.tsx" "import { GoogleSignin }" "GoogleSignin imported"
check_pattern "frontend/screens/MedicalStaffSignupScreen.tsx" "phone_number: phoneNumber" "Uses phone_number field"
check_pattern "frontend/screens/MedicalStaffSignupScreen.tsx" "ProfileHeader" "Has ProfileHeader"
check_not_pattern "frontend/screens/MedicalStaffSignupScreen.tsx" "const GoogleSignin: any = null" "GoogleSignin not set to null"
check_not_pattern "frontend/screens/MedicalStaffSignupScreen.tsx" "Alert.prompt" "No Alert.prompt usage"
echo ""

echo "📋 Checking ProfileHeader.tsx..."
check_pattern "frontend/components/ProfileHeader.tsx" "Guest" "Shows Guest status"
check_pattern "frontend/components/ProfileHeader.tsx" "Not signed in" "Shows Not signed in"
check_pattern "frontend/components/ProfileHeader.tsx" "guestAvatar" "Has guest avatar style"
echo ""

echo "📋 Checking for common mistakes..."
check_not_pattern "frontend/screens/SignupScreen.tsx" "phone:" "Not using 'phone:' (should be phone_number)"
check_not_pattern "frontend/screens/MedicalStaffSignupScreen.tsx" "phone:" "Not using 'phone:' (should be phone_number)"
echo ""

# Run automated tests
echo "🧪 Running automated API tests..."
if node test_auth_all_roles.js; then
    echo -e "${GREEN}✅${NC} All automated tests passed"
else
    echo -e "${RED}❌${NC} Some automated tests failed"
    ((ERRORS++))
fi
echo ""

# Summary
echo "================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Authentication is consistent across all screens."
    echo "Safe to proceed."
    exit 0
else
    echo -e "${RED}❌ $ERRORS check(s) failed!${NC}"
    echo ""
    echo "Please fix the issues above before claiming work is done."
    echo "See TESTING_CHECKLIST.md for detailed testing requirements."
    exit 1
fi
