#!/bin/bash

echo "========================================="
echo "🚀 Starting Medicure Expo Development Server"
echo "========================================="
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -9 -f "expo start" 2>/dev/null
pkill -9 -f "Metro" 2>/dev/null
lsof -ti:8081,8082 | xargs kill -9 2>/dev/null
sleep 2
echo "✅ Cleanup complete"
echo ""

# Navigate to frontend directory
cd /Users/user/github/medicure/frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start Expo
echo "🎯 Starting Expo on port 8082..."
echo "📱 Scan the QR code below with:"
echo "   - iOS: Camera app or Expo Go"
echo "   - Android: Expo Go app"
echo ""
echo "🌐 Or open in browser: http://localhost:8082"
echo ""
echo "========================================="
echo ""

npx expo start --port 8082

# If expo exits, show message
echo ""
echo "========================================="
echo "Expo server stopped"
echo "========================================="
