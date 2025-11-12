#!/bin/bash
# Start frontend development server

echo "Starting Quantum Chat Frontend..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start development server
echo "Starting Vite dev server on http://localhost:3000"
npm run dev
