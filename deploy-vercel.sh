#!/bin/bash

echo "🚀 Deploying to Vercel"
echo "======================"

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy ML API
echo "📊 Deploying ML API..."
cd api
vercel --prod
cd ..

# Deploy RAG API
echo "🧠 Deploying RAG API..."
cd rag-system
vercel --prod
cd ..

echo "✅ Deployment complete!"