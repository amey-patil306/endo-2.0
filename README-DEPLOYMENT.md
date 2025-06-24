# 🚀 Deployment Guide for Windows

This guide will help you deploy the Endometriosis Tracker APIs on Windows.

## 📋 Prerequisites

1. **Node.js** installed (for CLI tools)
2. **Git** installed and configured
3. **PowerShell** (comes with Windows)

## 🎯 Quick Start - Railway (Recommended)

Railway is the easiest platform for beginners:

```powershell
# Run the Railway deployment script
.\deploy-railway.ps1
```

### What happens:
1. Installs Railway CLI if needed
2. Prompts you to login to Railway
3. Deploys both ML and RAG APIs
4. Gives you the URLs

## 🌐 Alternative - Render (Manual but Reliable)

```powershell
# Get deployment instructions
.\deploy-render.ps1
```

### Manual Steps for Render:
1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Create two services:

**ML API Service:**
- Name: `endometriosis-ml-api`
- Root Directory: `api`
- Build Command: `pip install -r requirements.txt`
- Start Command: `python predict_api.py`

**RAG API Service:**
- Name: `endometriosis-rag-api`
- Root Directory: `rag-system`
- Build Command: `pip install -r requirements.txt`
- Start Command: `python rag_api.py`

## 🧪 Testing Your Deployment

After deployment, test your APIs:

```powershell
# Test with your deployed URLs
.\test-apis.ps1 -MLApiUrl "https://your-ml-api-url" -RAGApiUrl "https://your-rag-api-url"

# Or test locally
.\test-apis.ps1
```

## 🔧 Update Frontend Configuration

After successful deployment, update `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  ML_API_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-actual-ml-api-url'  // Replace with your URL
    : 'http://localhost:8000',
    
  RAG_API_URL: process.env.NODE_ENV === 'production'
    ? 'https://your-actual-rag-api-url'  // Replace with your URL
    : 'http://localhost:8001',
};
```

## 🎉 Deploy Frontend

Once APIs are working, deploy the frontend:

```powershell
# Build the frontend
npm run build

# Deploy to Netlify (drag & drop the dist folder)
# Or use Vercel CLI
npx vercel --prod
```

## 🆘 Troubleshooting

### Railway Issues:
- Make sure you're logged in: `railway login`
- Check Railway dashboard for build logs
- Ensure your GitHub repo is connected

### Render Issues:
- Check build logs in Render dashboard
- Verify Python version is 3.11
- Make sure requirements.txt is correct

### API Not Responding:
- Check health endpoints first: `/health`
- Verify CORS settings
- Check deployment logs

## 📞 Need Help?

If you encounter issues:
1. Check the deployment logs
2. Verify all files are committed to Git
3. Test APIs individually
4. Check network/firewall settings

## 🎯 Success Checklist

- [ ] APIs deployed successfully
- [ ] Health checks pass
- [ ] Prediction endpoint works
- [ ] Frontend config updated
- [ ] Frontend deployed
- [ ] End-to-end testing complete

---

**Next Steps:** Once everything is deployed, you'll have a fully functional endometriosis tracking app with AI-powered insights! 🎉