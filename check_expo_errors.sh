#!/bin/bash

echo "🔍 Checking for Expo/React Native errors..."
echo "==========================================="
echo ""

# Check if Expo is running
EXPO_PID=$(lsof -ti:8081 2>/dev/null)

if [ -z "$EXPO_PID" ]; then
    echo "❌ Expo is not running on port 8081"
    echo ""
    echo "Start it with: ./start_frontend.sh"
    exit 1
fi

echo "✅ Expo is running (PID: $EXPO_PID)"
echo ""
echo "📋 Recent logs (last 50 lines):"
echo "---"

# Try to find the Expo process and its output
ps -p $EXPO_PID -o command= | head -1

echo ""
echo "To see live logs, the Expo terminal (s011) should show:"
echo "- Bundle errors"
echo "- Runtime errors"
echo "- Console.log output"
echo ""
echo "Common crash causes in Expo Go:"
echo "1. Native module imports (we fixed GoogleSignin)"
echo "2. Navigation errors (wrong screen names)"
echo "3. Undefined variables in render"
echo "4. Missing dependencies"
echo ""
echo "Please share the error from the Expo terminal when you click the button."
