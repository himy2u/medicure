#!/bin/bash

echo "🚀 Starting Medicure Backend"
echo "============================="
echo ""

# Kill any existing backend on port 8000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Killing existing backend on port 8000..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Start backend
echo "📦 Starting backend on http://0.0.0.0:8000"
echo ""
cd backend
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# This will run in foreground and show all logs
