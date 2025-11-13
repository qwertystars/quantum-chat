#!/bin/bash
set -e  # Exit on any error

echo "======================================"
echo "🚀 Quantum Chat - Unified Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check prerequisites
print_step "Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_success "All prerequisites found"
echo ""

# Setup Backend
print_step "Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_step "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_success "Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate

# Install backend dependencies
print_step "Installing Python dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
print_success "Backend dependencies installed"

cd ..
echo ""

# Setup and Build Frontend
print_step "Setting up frontend..."
cd frontend

# Install frontend dependencies
if [ ! -d "node_modules" ]; then
    print_step "Installing Node.js dependencies..."
    npm install
    print_success "Frontend dependencies installed"
else
    print_success "Frontend dependencies already installed"
fi

# Build frontend for production
print_step "Building frontend..."
npm run build
print_success "Frontend built successfully"

cd ..
echo ""

PORT="${PORT:-10000}"

# Start the unified server
print_step "Starting unified Quantum Chat server..."
echo ""
echo "======================================"
echo -e "${GREEN}Server starting on http://localhost:${PORT}${NC}"
echo "======================================"
echo ""
echo "API Documentation: http://localhost:${PORT}/docs"
echo "WebSocket: ws://localhost:${PORT}/ws/{session_id}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the backend server which serves both API and frontend
source backend/venv/bin/activate
export PYTHONPATH="${PWD}:${PYTHONPATH}"
uvicorn backend.api.main:app --host 0.0.0.0 --port "${PORT}"
