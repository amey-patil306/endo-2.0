import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';
import { onAuthStateChange } from './lib/auth';
import { initializeSupabaseSchema, testSupabaseConnection } from './lib/supabaseSetup';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import { AlertCircle, Database, CheckCircle } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    tablesExist: boolean;
    errors: string[];
    checking: boolean;
  }>({
    connected: false,
    tablesExist: false,
    errors: [],
    checking: true
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      setUser(user);
      
      if (user) {
        // Initialize Supabase schema when user logs in
        await initializeSupabase();
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeSupabase = async () => {
    try {
      setSupabaseStatus(prev => ({ ...prev, checking: true }));
      
      // Initialize schema
      await initializeSupabaseSchema();
      
      // Test connection and tables
      const status = await testSupabaseConnection();
      
      setSupabaseStatus({
        connected: status.connected,
        tablesExist: status.tablesExist,
        errors: status.errors,
        checking: false
      });
    } catch (error) {
      console.error('Error initializing Supabase:', error);
      setSupabaseStatus({
        connected: false,
        tablesExist: false,
        errors: [`Initialization failed: ${error}`],
        checking: false
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Show Supabase status if there are issues
  if (user && (!supabaseStatus.connected || !supabaseStatus.tablesExist || supabaseStatus.checking)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Setting up Database
                </h2>
                <p className="text-sm text-gray-600">
                  Initializing Supabase tables...
                </p>
              </div>
            </div>

            {supabaseStatus.checking && (
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-800">Checking database setup...</span>
              </div>
            )}

            {!supabaseStatus.checking && (
              <div className="space-y-3">
                <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                  supabaseStatus.connected 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  {supabaseStatus.connected ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span>
                    Connection: {supabaseStatus.connected ? 'Connected' : 'Failed'}
                  </span>
                </div>

                <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                  supabaseStatus.tablesExist 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-yellow-50 text-yellow-800'
                }`}>
                  {supabaseStatus.tablesExist ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span>
                    Tables: {supabaseStatus.tablesExist ? 'Ready' : 'Setting up...'}
                  </span>
                </div>

                {supabaseStatus.errors && supabaseStatus.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">Setup Issues:</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      {supabaseStatus.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={initializeSupabase}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Retry Setup
                  </button>
                  
                  {supabaseStatus.connected && (
                    <button
                      onClick={() => setSupabaseStatus(prev => ({ ...prev, tablesExist: true }))}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Continue Anyway
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-4">
                  <p>If issues persist:</p>
                  <ol className="list-decimal list-inside space-y-1 mt-1">
                    <li>Check your Supabase project settings</li>
                    <li>Verify environment variables are correct</li>
                    <li>Run migrations manually in Supabase SQL editor</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {user ? <Dashboard user={user} /> : <AuthPage />}
    </div>
  );
}

export default App;