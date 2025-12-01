#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Watching Medicure Logs${NC}"
echo "================================="
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Function to show logs with colors
show_logs() {
    tail -f backend/backend.log 2>/dev/null | while read line; do
        if echo "$line" | grep -q "ERROR\|❌\|Exception"; then
            echo -e "${RED}[BACKEND] $line${NC}"
        elif echo "$line" | grep -q "✅\|SUCCESS"; then
            echo -e "${GREEN}[BACKEND] $line${NC}"
        elif echo "$line" | grep -q "📱\|🔐\|⚠️"; then
            echo -e "${YELLOW}[BACKEND] $line${NC}"
        else
            echo "[BACKEND] $line"
        fi
    done &
    
    BACKEND_PID=$!
    
    # Wait for Ctrl+C
    trap "kill $BACKEND_PID 2>/dev/null; exit" INT
    wait
}

show_logs
