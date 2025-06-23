#!/bin/bash

echo "🚀 Deploying Complete Endometriosis Tracker"
echo "=========================================="

# Step 1: Deploy ML API to Railway
echo "📊 Deploying ML API to Railway..."
cd api
railway login
railway init --name endometriosis-ml-api
railway up
ML_URL=$(railway status --json | jq -r '.deployments[0].url')
echo "✅ ML API deployed to: $ML_URL"
cd ..

# Step 2: Deploy RAG API to Render (manual step)
echo "🧠 RAG API deployment:"
echo "1. Push code to GitHub"
echo "2. Go to render.com and connect your repo"
echo "3. Select 'rag-system' folder"
echo "4. Set start command: uvicorn rag_api:app --host 0.0.0.0 --port \$PORT"
echo "5. Note the URL for next step"

read -p "Enter your Render RAG API URL: " RAG_URL

# Step 3: Update frontend config
echo "⚙️ Updating frontend configuration..."
cat > src/config/api.ts << EOF
export const API_CONFIG = {
  ML_API_URL: process.env.NODE_ENV === 'production' 
    ? '$ML_URL'
    : 'http://localhost:8000',
    
  RAG_API_URL: process.env.NODE_ENV === 'production'
    ? '$RAG_URL'
    : 'http://localhost:8001',
    
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
};

export const getMLApiUrl = () => API_CONFIG.ML_API_URL;
export const getRAGApiUrl = () => API_CONFIG.RAG_API_URL;
EOF

# Step 4: Deploy frontend to Netlify
echo "🌐 Deploying frontend to Netlify..."
npm run build
npx netlify-cli deploy --prod --dir=dist

echo "🎉 Deployment complete!"
echo "Your complete endometriosis tracker is now live!"