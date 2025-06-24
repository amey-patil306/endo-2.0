#!/bin/bash

echo "🚀 Deploying to Railway"
echo "======================"

# Install Railway CLI if not installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "Please login to Railway..."
railway login

# Deploy ML API
echo "📊 Deploying ML API..."
cd api
railway init --name endometriosis-ml-api
railway up
cd ..

# Deploy RAG API
echo "🧠 Deploying RAG API..."
cd rag-system
railway init --name endometriosis-rag-api
railway up
cd ..

echo "✅ Deployment complete!"
echo "Check your Railway dashboard for URLs"