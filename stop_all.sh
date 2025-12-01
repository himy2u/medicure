#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping Medicure Application${NC}"
echo "================================="
echo ""

# Stop Backend
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "📦 Stopping Backend..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    echo -e "   ${GREEN}✅ Backend stopped${NC}"
else
    echo "   Backend not running"
fi

# Stop Frontend
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "📱 Stopping Frontend..."
    lsof -ti:8081 | xargs kill -9 2>/dev/null
    echo -e "   ${GREEN}✅ Frontend stopped${NC}"
else
    echo "   Frontend not running"
fi

# Kill any remaining node/python processes related to the project
echo ""
echo "🧹 Cleaning up remaining processes..."
pkill -f "uvicorn main:app" 2>/dev/null
pkill -f "expo start" 2>/dev/null

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
