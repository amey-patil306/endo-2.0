# 🚀 Frontend Deployment Guide

## 🎯 Option 1: Netlify (Recommended - Easiest)

### Method A: Drag & Drop (Simplest)
1. **Build your project:**
   ```bash
   npm run build
   ```

2. **Go to [netlify.com](https://netlify.com)**
3. **Sign up/Login** with GitHub
4. **Drag the `dist` folder** to the deploy area
5. **Done!** You'll get a URL like `https://amazing-name-123456.netlify.app`

### Method B: Git Integration (Automatic updates)
1. **Push your code to GitHub** (if not already)
2. **Go to [netlify.com](https://netlify.com)**
3. **Click "New site from Git"**
4. **Connect GitHub** and select your repository
5. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **Deploy!**

## 🎯 Option 2: Vercel (Also Easy)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npx vercel --prod
```

## 🎯 Option 3: Railway (Same platform as your APIs)

```bash
# In your project root
railway init --name endometriosis-frontend
railway up
```

## 🔧 Important: Update Environment Variables

After deployment, you need to set your environment variables in your hosting platform:

### For Netlify:
1. Go to your site dashboard
2. Click "Site settings" → "Environment variables"
3. Add these variables:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### For Vercel:
1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add the same variables

### For Railway:
1. Go to your service dashboard
2. Click "Variables"
3. Add the same variables

## 🧪 Test Your Deployment

After deployment, test your app:
1. Visit your deployed URL
2. Try signing up/logging in
3. Test symptom tracking
4. Test AI predictions
5. Verify all features work

## 🎉 You're Done!

Your complete endometriosis tracker is now live with:
- ✅ Frontend deployed
- ✅ ML API on Railway
- ✅ RAG API on Railway
- ✅ Supabase database
- ✅ Real-time sync
- ✅ AI predictions