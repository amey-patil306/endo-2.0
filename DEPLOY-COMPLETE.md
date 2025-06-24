# 🎯 Complete Deployment Guide

## Step 1: Get Your Railway URLs

First, get your Railway API URLs:

```powershell
# Check your Railway deployments
railway status
```

Your URLs should look like:
- `https://endometriosis-ml-api-production.up.railway.app`
- `https://endometriosis-rag-api-production.up.railway.app`

## Step 2: Update API Configuration

```powershell
# Update your API URLs (replace with your actual URLs)
.\update-api-urls.ps1 -MLApiUrl "https://your-ml-api.up.railway.app" -RAGApiUrl "https://your-rag-api.up.railway.app"
```

## Step 3: Test Your APIs

```powershell
# Test your deployed APIs
.\test-railway-urls.ps1 -MLApiUrl "https://your-ml-api.up.railway.app" -RAGApiUrl "https://your-rag-api.up.railway.app"
```

## Step 4: Deploy Frontend

Choose one option:

### Option A: Netlify (Recommended)
```powershell
.\deploy-netlify.ps1
```

### Option B: Vercel
```powershell
.\deploy-vercel-frontend.ps1
```

### Option C: Manual Netlify (Drag & Drop)
1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder to deploy

## Step 5: Set Environment Variables

In your hosting platform dashboard, add:
- `VITE_SUPABASE_URL` = your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

## Step 6: Test Everything

1. Visit your deployed frontend URL
2. Sign up for an account
3. Log some symptoms
4. Test the AI prediction feature
5. Verify real-time sync works

## 🎉 Success!

You now have a fully deployed endometriosis tracking app with:
- ✅ React frontend (Netlify/Vercel)
- ✅ ML API (Railway)
- ✅ RAG API (Railway)
- ✅ Supabase database
- ✅ Real-time synchronization
- ✅ AI-powered predictions

## 🆘 Troubleshooting

### Frontend won't load:
- Check environment variables are set
- Verify API URLs are correct
- Check browser console for errors

### APIs not responding:
- Test API health endpoints
- Check Railway deployment logs
- Verify CORS settings

### Database issues:
- Check Supabase connection
- Verify environment variables
- Run database migrations

## 📞 Need Help?

If you encounter issues:
1. Check deployment logs
2. Test each component individually
3. Verify all environment variables
4. Check network connectivity