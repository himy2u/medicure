#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo -e "${BLUE}📊 Medicure Service Monitor${NC}"
echo "Press Ctrl+C to stop monitoring"
echo "================================="
echo ""

while true; do
    clear
    echo -e "${BLUE}📊 Medicure Service Monitor - $(date '+%H:%M:%S')${NC}"
    echo "================================="
    echo ""
    
    # Backend Status
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null)
    BACKEND_PID=$(lsof -ti:8000 2>/dev/null)
    
    echo -n "📦 Backend: "
    if [ "$BACKEND_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ HEALTHY${NC} (PID: $BACKEND_PID)"
    elif [ -n "$BACKEND_PID" ]; then
        echo -e "${YELLOW}⚠️  STARTING${NC} (PID: $BACKEND_PID)"
    else
        echo -e "${RED}❌ DOWN${NC}"
    fi
    
    # Frontend Status
    FRONTEND_PID=$(lsof -ti:8081 2>/dev/null)
    echo -n "📱 Frontend: "
    if [ -n "$FRONTEND_PID" ]; then
        echo -e "${GREEN}✅ RUNNING${NC} (PID: $FRONTEND_PID)"
    else
        echo -e "${RED}❌ DOWN${NC}"
    fi
    
    echo ""
    echo "📍 URLs:"
    echo "   Backend:  http://$CURRENT_IP:8000"
    echo "   Frontend: http://$CURRENT_IP:8081"
    
    echo ""
    echo "📋 Recent Backend Logs:"
    echo "---"
    tail -5 backend/backend.log 2>/dev/null | sed 's/^/   /'
    
    echo ""
    echo "================================="
    echo "Refreshing in 5 seconds... (Ctrl+C to stop)"
    
    sleep 5
done
