#!/bin/bash
# MediCore — Quick Start Script
# Run this from the project root: bash start.sh

echo ""
echo "🏥 MediCore Hospital Management Platform"
echo "========================================="
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi
echo "✅ Node $(node -v) found"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
  echo "⚠️  mongod not in PATH — make sure MongoDB is running locally on port 27017"
  echo "   Or update MONGO_URI in backend/.env to point to MongoDB Atlas"
else
  echo "✅ MongoDB found"
fi

echo ""
echo "📦 Installing backend dependencies..."
cd backend && npm install

echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install

echo ""
echo "========================================="
echo "✅ Ready! Now open TWO terminals and run:"
echo ""
echo "  Terminal 1 (backend):"
echo "    cd backend && npm run dev"
echo ""
echo "  Terminal 2 (frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "  Then open: http://localhost:5173"
echo "  Click 'Create Account' to register and log in."
echo "========================================="
