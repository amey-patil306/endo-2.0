# PowerShell script to update API URLs
param(
    [Parameter(Mandatory=$true)]
    [string]$MLApiUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$RAGApiUrl
)

Write-Host "🔧 Updating API Configuration" -ForegroundColor Green
Write-Host "============================="

$configPath = "src/config/api.ts"

$newConfig = @"
// API Configuration for production
export const API_CONFIG = {
  // Your actual Railway URLs
  ML_API_URL: process.env.NODE_ENV === 'production' 
    ? '$MLApiUrl'
    : 'http://localhost:8000',
    
  RAG_API_URL: process.env.NODE_ENV === 'production'
    ? '$RAGApiUrl'
    : 'http://localhost:8001',
    
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
};

// Helper function to get API URLs
export const getMLApiUrl = () => API_CONFIG.ML_API_URL;
export const getRAGApiUrl = () => API_CONFIG.RAG_API_URL;
"@

$newConfig | Out-File -FilePath $configPath -Encoding UTF8

Write-Host "✅ Updated $configPath with:" -ForegroundColor Green
Write-Host "   ML API: $MLApiUrl" -ForegroundColor White
Write-Host "   RAG API: $RAGApiUrl" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Now run your deployment script!" -ForegroundColor Cyan