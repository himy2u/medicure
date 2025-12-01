#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo -e "${BLUE}🏥 Medicure Health Check${NC}"
echo "================================="
echo ""

# Check Backend
echo -n "📦 Backend (http://$CURRENT_IP:8000): "
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null)

if [ "$BACKEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ HEALTHY${NC}"
    BACKEND_HEALTHY=true
else
    echo -e "${RED}❌ DOWN (HTTP $BACKEND_RESPONSE)${NC}"
    BACKEND_HEALTHY=false
fi

# Check if backend process is running
BACKEND_PID=$(lsof -ti:8000 2>/dev/null)
if [ -n "$BACKEND_PID" ]; then
    echo "   Process: Running (PID: $BACKEND_PID)"
else
    echo -e "   Process: ${RED}Not running${NC}"
fi

echo ""

# Check Frontend
echo -n "📱 Frontend (http://$CURRENT_IP:8081): "
FRONTEND_PID=$(lsof -ti:8081 2>/dev/null)

if [ -n "$FRONTEND_PID" ]; then
    echo -e "${GREEN}✅ RUNNING${NC}"
    echo "   Process: Running (PID: $FRONTEND_PID)"
    FRONTEND_HEALTHY=true
else
    echo -e "${RED}❌ NOT RUNNING${NC}"
    FRONTEND_HEALTHY=false
fi

echo ""

# Check Database Connection (if backend is healthy)
if [ "$BACKEND_HEALTHY" = true ]; then
    echo -n "🗄️  Database: "
    # Try to hit an endpoint that requires DB
    DB_CHECK=$(curl -s http://localhost:8000/ 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ CONNECTED${NC}"
    else
        echo -e "${YELLOW}⚠️  UNKNOWN${NC}"
    fi
fi

echo ""

# Check Twilio Configuration
echo -n "📞 Twilio Config: "
if grep -q "TWILIO_ACCOUNT_SID=AC" backend/.env 2>/dev/null; then
    echo -e "${GREEN}✅ CONFIGURED${NC}"
else
    echo -e "${RED}❌ NOT CONFIGURED${NC}"
fi

echo ""
echo "================================="

# Overall status
if [ "$BACKEND_HEALTHY" = true ] && [ "$FRONTEND_HEALTHY" = true ]; then
    echo -e "${GREEN}✅ All services are healthy!${NC}"
    echo ""
    echo "🧪 Test WhatsApp OTP:"
    echo "   ./test_whatsapp_flow.sh"
    exit 0
else
    echo -e "${RED}❌ Some services are down!${NC}"
    echo ""
    echo "📋 Check logs:"
    echo "   Backend:  tail -f backend/backend.log"
    echo "   Frontend: tail -f frontend/frontend.log"
    exit 1
fi
