#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current IP
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo -e "${BLUE}🚀 Starting Medicure Application${NC}"
echo "================================="
echo ""
echo "📍 Detected IP: $CURRENT_IP"
echo ""

# Function to check if a port is in use
check_port() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to wait for service to be healthy
wait_for_health() {
    local url=$1
    local service=$2
    local max_attempts=30
    local attempt=0
    
    echo -n "⏳ Waiting for $service to be healthy..."
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e " ${GREEN}✅${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
        ((attempt++))
    done
    
    echo -e " ${RED}❌ TIMEOUT${NC}"
    return 1
}

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
if check_port 8000; then
    echo "   Killing backend on port 8000..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 2
fi

if check_port 8081; then
    echo "   Killing frontend on port 8081..."
    lsof -ti:8081 | xargs kill -9 2>/dev/null
    sleep 2
fi

echo ""

# Start Backend
echo "📦 Starting Backend..."
cd backend
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
cd ..

# Wait for backend to be healthy
if wait_for_health "http://localhost:8000/health" "Backend"; then
    echo -e "   ${GREEN}Backend is running at http://$CURRENT_IP:8000${NC}"
else
    echo -e "   ${RED}Backend failed to start! Check backend/backend.log${NC}"
    tail -20 backend/backend.log
    exit 1
fi

echo ""

# Start Frontend
echo "📱 Starting Frontend..."
cd frontend
npx expo start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
cd ..

# Give frontend a moment to start
sleep 5

echo ""
echo "================================="
echo -e "${GREEN}✅ Application Started Successfully!${NC}"
echo ""
echo "📍 Services:"
echo "   Backend:  http://$CURRENT_IP:8000"
echo "   Frontend: http://$CURRENT_IP:8081"
echo ""
echo "📋 View logs:"
echo "   Backend:  tail -f backend/backend.log"
echo "   Frontend: tail -f frontend/frontend.log"
echo ""
echo "🔍 Check status:"
echo "   ./check_health.sh"
echo ""
echo "🛑 Stop all:"
echo "   ./stop_all.sh"
echo ""

# Run initial health check
sleep 2
./check_health.sh
