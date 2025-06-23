import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { getDummyDataManager, DummyDataManager } from '../utils/dummyDataManager';
import { dummyUserProfiles } from '../utils/dummyData';
import { Database, Users, Trash2, Plus, RefreshCw, AlertTriangle } from 'lucide-react';

interface DummyDataPanelProps {
  user: User;
  onDataLoaded: () => void;
}

const DummyDataPanel: React.FC<DummyDataPanelProps> = ({ user, onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [dummyManager] = useState(() => getDummyDataManager(user.uid));

  const handleLoadProfile = async (profileType: 'highRisk' | 'moderateRisk' | 'lowRisk') => {
    setLoading(true);
    try {
      await dummyManager.loadDummyProfile(profileType);
      onDataLoaded();
    } finally {
      setLoading(false);
    }
  };

  const handleLoadRandom = async () => {
    setLoading(true);
    try {
      await dummyManager.loadRandomDummyData(15);
      onDataLoaded();
    } finally {
      setLoading(false);
    }
  };

  const handleAddMore = async () => {
    setLoading(true);
    try {
      await dummyManager.addMoreDummyData(5);
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
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Demo Data Controls"
        >
          <Database className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Demo Data Controls</h3>
        </div>
        <button
          onClick={() => setShowPanel(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-xs text-yellow-800">
              <p className="font-medium">Demo Mode</p>
              <p>Use these controls to load sample data for testing and demonstration.</p>
            </div>
          </div>
        </div>

        {/* Profile-based data */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Load Sample Profiles</h4>
          <div className="space-y-2">
            {Object.entries(dummyUserProfiles).map(([key, profile]) => (
              <button
                key={key}
                onClick={() => handleLoadProfile(key as any)}
                disabled={loading}
                className="w-full text-left p-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                <div className="text-xs text-gray-600">{profile.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleLoadRandom}
              disabled={loading}
              className="flex items-center justify-center space-x-1 p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50 transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Random Data</span>
            </button>
            
            <button
              onClick={handleAddMore}
              disabled={loading}
              className="flex items-center justify-center space-x-1 p-2 bg-green-50 text-green-700 rounded hover:bg-green-100 disabled:opacity-50 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add More</span>
            </button>
          </div>
        </div>

        {/* Clear data */}
        <div>
          <button
            onClick={handleClearData}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 p-2 bg-red-50 text-red-700 rounded hover:bg-red-100 disabled:opacity-50 transition-colors text-sm"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All Data</span>
          </button>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DummyDataPanel;