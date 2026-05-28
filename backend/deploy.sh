#!/bin/bash

# SoundSnap Backend Deployment Script
# Supports: Docker, Railway, Render

echo "🎵 SoundSnap Backend Deployment"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

echo ""
echo "Building Docker image..."
docker build -t soundsnap-backend .

echo ""
echo "✅ Docker image built successfully!"
echo ""
echo "To run locally:"
echo "  docker run -p 3001:3001 --env-file .env soundsnap-backend"
echo ""
echo "To deploy to cloud:"
echo ""
echo "1. Railway (Recommended - Free tier):"
echo "   - Install Railway CLI: npm i -g @railway/cli"
echo "   - Run: railway login"
echo "   - Run: railway init"
echo "   - Run: railway up"
echo ""
echo "2. Render:"
echo "   - Go to https://render.com"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Build Command: docker build -t soundsnap-backend ."
echo "   - Start Command: docker run -p \$PORT:3001 soundsnap-backend"
echo ""
echo "3. Fly.io:"
echo "   - Install Fly CLI: curl -L https://fly.io/install.sh | sh"
echo "   - Run: fly launch"
echo "   - Run: fly deploy"
echo ""
