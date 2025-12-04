#!/bin/bash

# Quick start script for MediCure development

echo "🚀 Starting MediCure Development Environment"
echo ""

# Check if backend is running
if ! pgrep -f "uvicorn main:app" > /dev/null; then
    echo "📦 Starting backend..."
    cd backend && source .venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    echo "✅ Backend started (PID: $BACKEND_PID)"
else
    echo "✅ Backend already running"
fi

# Wait a moment for backend to initialize
sleep 2

# Start frontend
echo "📱 Starting frontend..."
cd frontend
npx expo start --clear

echo ""
echo "🎉 Development environment ready!"
echo "Press 'i' to open iOS simulator"
echo "Press 'a' to open Android emulator"
echo "Press Ctrl+C to stop all services"
