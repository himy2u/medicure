#!/bin/bash

# Comprehensive test script for all roles
# Tests all workflows for all user roles

echo ""
echo "🧪 MEDICURE - ALL ROLES COMPREHENSIVE TEST"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0.32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Function to run test
run_test() {
    local test_name=$1
    local test_file=$2
    
    echo "📋 Running: $test_name"
    echo "----------------------------------------"
    
    if node "$test_file"; then
        echo -e "${GREEN}✅ $test_name PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $test_name FAILED${NC}"
        ((FAILED++))
    fi
    echo ""
}

# Run all tests
run_test "Comprehensive Feature Test" "test_all_features_complete.js"
run_test "Patient Role Workflow" "test_role_patient.js"
run_test "Doctor Role Workflow" "test_role_doctor.js"

# Summary
echo "=========================================="
echo "📊 TEST SUMMARY"
echo "=========================================="
echo -e "${GREEN}✅ Tests Passed: $PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASSED * 100 / TOTAL))
    echo "📈 Success Rate: $PERCENTAGE%"
fi

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
    echo ""
    exit 1
fi
