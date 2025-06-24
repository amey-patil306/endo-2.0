# PowerShell script for Render deployment
Write-Host "🚀 Deploying to Render" -ForegroundColor Green
Write-Host "======================"

Write-Host "Manual Render Deployment Steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://render.com and sign up/login" -ForegroundColor White
Write-Host "2. Click 'New +' > 'Web Service'" -ForegroundColor White
Write-Host "3. Connect your GitHub repository" -ForegroundColor White
Write-Host "4. For ML API:" -ForegroundColor Yellow
Write-Host "   - Name: endometriosis-ml-api" -ForegroundColor White
Write-Host "   - Root Directory: api" -ForegroundColor White
Write-Host "   - Build Command: pip install -r requirements.txt" -ForegroundColor White
Write-Host "   - Start Command: python predict_api.py" -ForegroundColor White
Write-Host "5. For RAG API:" -ForegroundColor Yellow
Write-Host "   - Name: endometriosis-rag-api" -ForegroundColor White
Write-Host "   - Root Directory: rag-system" -ForegroundColor White
Write-Host "   - Build Command: pip install -r requirements.txt" -ForegroundColor White
Write-Host "   - Start Command: python rag_api.py" -ForegroundColor White

Write-Host "`n📋 After deployment, update src/config/api.ts with your URLs" -ForegroundColor Green