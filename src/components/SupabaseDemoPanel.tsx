import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { getSupabaseDummyManager } from '../utils/supabaseDummyManager';
import { mayScenarios } from '../utils/mayDummyData';
import { Database, Calendar, Users, Trash2, Plus, RefreshCw, AlertTriangle, Zap } from 'lucide-react';

interface SupabaseDemoPanelProps {
  user: User;
  onDataLoaded: () => void;
}

const SupabaseDemoPanel: React.FC<SupabaseDemoPanelProps> = ({ user, onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [dummyManager] = useState(() => getSupabaseDummyManager(user.uid));

  const handleLoadMayScenario = async (scenario: 'highRisk' | 'moderateRisk' | 'lowRisk') => {
    setLoading(true);
    try {
      await dummyManager.loadMayScenario(scenario);
      onDataLoaded();
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCustomMay = async () => {
    setLoading(true);
    try {
      await dummyManager.loadCustomMayData({
        riskLevel: 'moderate',
        symptomIntensity: 0.6,
        includeNotes: true
      });
      onDataLoaded();
    } finally {
      setLoading(false);
    }
  };

  const handleAddRandomDays = async () => {
    setLoading(true);
    try {
      await dummyManager.addRandomDays(7);
      onDataLoaded();
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      await dummyManager.clearAllData();
      onDataLoaded();
    } finally {
      setLoading(false);
    }
  };

  if (!showPanel) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowPanel(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
          title="Supabase Demo Controls"
        >
          <Database className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-96 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Supabase Demo</h3>
            <p className="text-xs text-gray-500">Real-time data controls</p>
          </div>
        </div>
        <button
          onClick={() => setShowPanel(false)}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
      </div>

      <div className="space-y-6">
        {/* Real-time indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-green-600" />
            <div className="text-sm">
              <p className="font-medium text-green-900">Real-time Sync Active</p>
              <p className="text-green-700">Data updates instantly across all devices</p>
            </div>
          </div>
        </div>

        {/* May 2024 Scenarios */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            May 2024 Complete Data
          </h4>
          <div className="space-y-3">
            {Object.entries(mayScenarios).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => handleLoadMayScenario(key as any)}
                disabled={loading}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{scenario.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{scenario.description}</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    key === 'highRisk' ? 'bg-red-400' :
                    key === 'moderateRisk' ? 'bg-yellow-400' : 'bg-green-400'
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleLoadCustomMay}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors text-sm"
            >
              <RefreshCw className="h-5 w-5 mb-1" />
              <span>Custom May</span>
            </button>
            
            <button
              onClick={handleAddRandomDays}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors text-sm"
            >
              <Plus className="h-5 w-5 mb-1" />
              <span>Add 7 Days</span>
            </button>
          </div>
        </div>

        {/* Advanced Options */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Advanced</h4>
          <button
            onClick={handleClearData}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors text-sm"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All Data</span>
          </button>
        </div>

        {/* Features Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Supabase Features</h5>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Real-time data synchronization</li>
            <li>• Automatic conflict resolution</li>
            <li>• Offline-first architecture</li>
            <li>• Row-level security</li>
            <li>• Instant UI updates</li>
          </ul>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-800 font-medium">Processing with Supabase...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseDemoPanel;