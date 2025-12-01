#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📱 Starting Expo Frontend${NC}"
echo "================================="
echo ""

# Kill existing frontend
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "🧹 Killing existing frontend..."
    lsof -ti:8081 | xargs kill -9 2>/dev/null
    sleep 2
fi

echo "🚀 Starting Expo..."
echo ""
echo "This will show the QR code to scan with Expo Go app"
echo "Press Ctrl+C to stop"
echo ""
echo "================================="
echo ""

cd frontend
npx expo start --go

# This runs in foreground so you can see the QR code
# --go flag ensures it works with Expo Go app
