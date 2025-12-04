#!/bin/bash

echo "🧪 MEDICURE - COMPLETE TEST SUITE"
echo "=================================="
echo ""

# Check if backend is running
if ! curl -s http://192.168.100.91:8000/health > /dev/null 2>&1; then
    echo "❌ Backend is not running!"
    echo "   Start it with: ./start_backend_only.sh"
    exit 1
fi

echo "✅ Backend is running"
echo ""

# Run the complete signup flow test
echo "📱 Testing WhatsApp Signup Flow for All Roles..."
echo ""
node test_complete_signup_flow.js

echo ""
echo "=================================="
echo "✅ All tests complete!"
echo ""
echo "Next: Test in the actual app"
echo "1. Reload Expo app"
echo "2. Try WhatsApp signup"
echo "3. Verify it doesn't crash"
