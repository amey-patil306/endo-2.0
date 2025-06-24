# PowerShell script for Railway deployment
Write-Host "🚀 Deploying to Railway" -ForegroundColor Green
Write-Host "======================"

# Check if Railway CLI is installed
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Login to Railway
Write-Host "Please login to Railway..." -ForegroundColor Cyan
railway login

# Deploy ML API
Write-Host "📊 Deploying ML API..." -ForegroundColor Blue
Set-Location api
railway init --name endometriosis-ml-api
railway up
Set-Location ..

# Deploy RAG API
Write-Host "🧠 Deploying RAG API..." -ForegroundColor Blue
Set-Location rag-system
railway init --name endometriosis-rag-api
railway up
Set-Location ..

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Check your Railway dashboard for URLs" -ForegroundColor Cyan