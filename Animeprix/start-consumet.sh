#!/bin/bash

# Start Consumet API only
# Usage: ./start-consumet.sh

echo "🎬 Starting Consumet API on port 3002..."

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

# Start Consumet API
cd ../consumet-api
npm start

