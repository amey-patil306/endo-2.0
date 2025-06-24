// API Configuration for production
export const API_CONFIG = {
  // Update these URLs after deployment
  ML_API_URL: process.env.NODE_ENV === 'production' 
    ? 'https://endometriosis-ml-api.onrender.com'  // Your ML API URL
    : 'http://localhost:8000',
    
  RAG_API_URL: process.env.NODE_ENV === 'production'
    ? 'https://endometriosis-rag-api.onrender.com'  // Your RAG API URL  
    : 'http://localhost:8001',
    
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
};

// Helper function to get API URLs
export const getMLApiUrl = () => API_CONFIG.ML_API_URL;
export const getRAGApiUrl = () => API_CONFIG.RAG_API_URL;