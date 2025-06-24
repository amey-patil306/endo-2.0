# PowerShell script to test deployed APIs
param(
    [string]$MLApiUrl = "http://localhost:8000",
    [string]$RAGApiUrl = "http://localhost:8001"
)

Write-Host "🧪 Testing APIs" -ForegroundColor Green
Write-Host "==============="

# Test ML API Health
Write-Host "`n📊 Testing ML API Health..." -ForegroundColor Blue
try {
    $mlHealth = Invoke-RestMethod -Uri "$MLApiUrl/health" -Method Get
    Write-Host "✅ ML API Health: $($mlHealth.status)" -ForegroundColor Green
    Write-Host "   Model Loaded: $($mlHealth.model_loaded)" -ForegroundColor White
} catch {
    Write-Host "❌ ML API Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test RAG API Health
Write-Host "`n🧠 Testing RAG API Health..." -ForegroundColor Blue
try {
    $ragHealth = Invoke-RestMethod -Uri "$RAGApiUrl/health" -Method Get
    Write-Host "✅ RAG API Health: $($ragHealth.status)" -ForegroundColor Green
    Write-Host "   RAG Service Loaded: $($ragHealth.rag_service_loaded)" -ForegroundColor White
} catch {
    Write-Host "❌ RAG API Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test ML API Prediction
Write-Host "`n🔬 Testing ML API Prediction..." -ForegroundColor Blue
try {
    $testSymptoms = @{
        Cramping = 1
        Pain_Chronic_pain = 1
        Extreme_Bloating = 1
        Migraines = 1
    }
    
    $prediction = Invoke-RestMethod -Uri "$MLApiUrl/predict" -Method Post -Body ($testSymptoms | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Prediction Result:" -ForegroundColor Green
    Write-Host "   Risk Level: $($prediction.risk_level)" -ForegroundColor White
    Write-Host "   Confidence: $([math]::Round($prediction.confidence * 100, 1))%" -ForegroundColor White
} catch {
    Write-Host "❌ ML API Prediction Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Green