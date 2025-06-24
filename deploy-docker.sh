#!/bin/bash

echo "🐳 Building and running with Docker"
echo "==================================="

# Build and run with docker-compose
docker-compose up --build -d

echo "✅ Services running!"
echo "ML API: http://localhost:8000"
echo "RAG API: http://localhost:8001"

# Show logs
echo "📋 Showing logs..."
docker-compose logs -f