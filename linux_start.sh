#!/bin/bash
if [ ! -d "node_modules" ]; then
    echo "node_modules folder not found. Installing dependencies..."
    npm install
fi
echo "Starting the project..."
npm run dev