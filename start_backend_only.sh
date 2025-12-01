#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo -e "${BLUE}🚀 Starting Medicure Backend${NC}"
echo "================================="
echo ""
echo "📍 Detected IP: $CURRENT_IP"
echo ""

# Kill existing backend
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "🧹 Killing existing backend..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 2
fi

echo "📦 Starting Backend..."
cd backend
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
cd ..

# Wait for backend
echo -n "⏳ Waiting for backend to be healthy..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e " ${GREEN}✅${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "================================="
echo -e "${GREEN}✅ Backend Started!${NC}"
echo ""
echo "📍 Backend: http://$CURRENT_IP:8000"
echo ""
echo "📋 View logs:"
echo "   tail -f backend/backend.log"
echo ""
echo "🔍 Check health:"
echo "   curl http://localhost:8000/health"
echo ""
echo "📱 Start frontend in another terminal:"
echo "   ./start_frontend.sh"
echo ""
