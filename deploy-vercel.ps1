# PowerShell script for Vercel deployment
Write-Host "🚀 Deploying to Vercel" -ForegroundColor Green
Write-Host "======================"

# Check if Vercel CLI is installed
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy ML API
Write-Host "📊 Deploying ML API..." -ForegroundColor Blue
Set-Location api
vercel --prod
Set-Location ..

# Deploy RAG API
Write-Host "🧠 Deploying RAG API..." -ForegroundColor Blue
Set-Location rag-system
vercel --prod
Set-Location ..

Write-Host "✅ Deployment complete!" -ForegroundColor Green