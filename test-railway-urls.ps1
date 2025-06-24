# Test Railway APIs
param(
    [string]$MLApiUrl = "",
    [string]$RAGApiUrl = ""
)

if (-not $MLApiUrl) {
    Write-Host "❌ Please provide ML API URL" -ForegroundColor Red
    Write-Host "Usage: .\test-railway-urls.ps1 -MLApiUrl 'https://your-ml-api.up.railway.app' -RAGApiUrl 'https://your-rag-api.up.railway.app'"
    exit
}

Write-Host "🧪 Testing Railway APIs" -ForegroundColor Green
Write-Host "======================="

# Test ML API
Write-Host "`n📊 Testing ML API: $MLApiUrl" -ForegroundColor Blue
try {
    $mlHealth = Invoke-RestMethod -Uri "$MLApiUrl/health" -Method Get -TimeoutSec 30
    Write-Host "✅ ML API Status: $($mlHealth.status)" -ForegroundColor Green
    Write-Host "   Model Loaded: $($mlHealth.model_loaded)" -ForegroundColor White
} catch {
    Write-Host "❌ ML API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test RAG API
if ($RAGApiUrl) {
    Write-Host "`n🧠 Testing RAG API: $RAGApiUrl" -ForegroundColor Blue
    try {
        $ragHealth = Invoke-RestMethod -Uri "$RAGApiUrl/health" -Method Get -TimeoutSec 30
        Write-Host "✅ RAG API Status: $($ragHealth.status)" -ForegroundColor Green
        Write-Host "   RAG Service: $($ragHealth.rag_service_loaded)" -ForegroundColor White
    } catch {
        Write-Host "❌ RAG API Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Testing Complete!" -ForegroundColor Green