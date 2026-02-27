#!/bin/bash

# Start Consumet API, backend, and frontend servers
# Usage: ./start-dev.sh

echo "🚀 Starting Animeprix Development Servers..."
echo ""

# Check if Consumet API exists
if [ ! -d "../consumet-api" ]; then
    echo "❌ Consumet API not found at ../consumet-api"
    echo "Please clone it first: git clone https://github.com/consumet/api.consumet.org.git ../consumet-api"
    exit 1
fi

# Check if Consumet API node_modules exists
if [ ! -d "../consumet-api/node_modules" ]; then
    echo "📦 Installing Consumet API dependencies..."
    cd ../consumet-api && npm install && cd ../Animeprix
fi

# Start Consumet API in background
echo "🎬 Starting Consumet API on port 3002..."
cd ../consumet-api
npm start &
CONSUMET_PID=$!
cd ../Animeprix

# Wait for Consumet API to start
sleep 5

# Check if Consumet API is running
if curl -s http://localhost:3002/ > /dev/null; then
    echo "✅ Consumet API is running!"
else
    echo "⚠️  Consumet API may not be ready yet..."
fi

# Check if backend node_modules exists
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Start backend in background
echo "🔧 Starting backend server on port 3001..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend server is running!"
else
    echo "⚠️  Backend server may not be ready yet..."
fi

echo ""
echo "🎨 Starting frontend server on port 5173..."
echo ""
echo "📝 Note: Keep this terminal open. Press Ctrl+C to stop all servers."
echo ""

# Start frontend
npm run dev

# Cleanup on exit
trap "kill $CONSUMET_PID $BACKEND_PID 2>/dev/null" EXIT

