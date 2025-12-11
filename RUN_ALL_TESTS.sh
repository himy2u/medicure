#!/bin/bash
# Comprehensive Test Suite for Medicure App
# Runs all backend API tests and frontend structure tests

echo "🏥 MEDICURE COMPREHENSIVE TEST SUITE"
echo "====================================="
echo ""

PASSED=0
FAILED=0

run_test() {
    local name="$1"
    local command="$2"
    
    echo "🧪 Running: $name"
    if eval "$command" > /dev/null 2>&1; then
        echo "   ✅ PASSED"
        ((PASSED++))
    else
        echo "   ❌ FAILED"
        ((FAILED++))
    fi
}

echo "📋 BACKEND API TESTS"
echo "--------------------"
run_test "All Features Test" "node test_all_features_complete.js"
run_test "Doctor Workflow Test" "node test_role_doctor.js"
run_test "Patient Workflow Test" "node test_role_patient.js"
run_test "Caregiver Workflow Test" "node test_role_caregiver.js"

echo ""
echo "📱 FRONTEND STRUCTURE TESTS"
echo "---------------------------"
run_test "UI Structure Test" "node test_ui_structure.js"
run_test "Scroll Configuration Test" "node test_scroll_config.js"

echo ""
echo "====================================="
echo "📊 FINAL RESULTS"
echo "====================================="
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED!"
    exit 0
else
    echo "⚠️  SOME TESTS FAILED"
    exit 1
fi
