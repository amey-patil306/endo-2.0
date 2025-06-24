// API Configuration for production
export const API_CONFIG = {
  // Replace these with your actual Railway URLs
  ML_API_URL: import.meta.env.PROD 
    ? 'https://endometriosis-ml-api-production.up.railway.app'  // Your Railway ML API URL
    : 'http://localhost:8000',
    
  RAG_API_URL: import.meta.env.PROD
    ? 'https://endometriosis-rag-api-production.up.railway.app'  // Your Railway RAG API URL  
    : 'http://localhost:8001',
    
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
};

// Helper function to get API URLs
export const getMLApiUrl = () => API_CONFIG.ML_API_URL;
export const getRAGApiUrl = () => API_CONFIG.RAG_API_URL;