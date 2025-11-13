#!/bin/bash
# Start backend server (standalone mode for development)
# For unified setup, use ./run.sh instead

echo "Starting Quantum Chat Backend..."

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment
source backend/venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r backend/requirements.txt

# Set PYTHONPATH to project root
export PYTHONPATH="${PWD}:${PYTHONPATH}"

# Start server
PORT="${PORT:-8000}"
echo "Starting FastAPI server on http://localhost:${PORT}"
uvicorn backend.api.main:app --reload --host 0.0.0.0 --port $PORT
