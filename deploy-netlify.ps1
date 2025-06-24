# PowerShell script for Netlify deployment
Write-Host "🚀 Deploying Frontend to Netlify" -ForegroundColor Green
Write-Host "================================="

# Check if Netlify CLI is installed
if (!(Get-Command netlify -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Netlify CLI..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Login to Netlify
Write-Host "🔐 Please login to Netlify..." -ForegroundColor Cyan
netlify login

# Deploy to Netlify
Write-Host "🚀 Deploying to Netlify..." -ForegroundColor Blue
netlify deploy --prod --dir=dist

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "📋 Don't forget to set environment variables in Netlify dashboard:" -ForegroundColor Yellow
Write-Host "   - VITE_SUPABASE_URL" -ForegroundColor White
Write-Host "   - VITE_SUPABASE_ANON_KEY" -ForegroundColor White