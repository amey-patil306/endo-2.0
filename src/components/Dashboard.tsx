import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import Calendar from './Calendar';
import ProgressBar from './ProgressBar';
import PredictionDashboard from './PredictionDashboard';
import DummyDataPanel from './DummyDataPanel';
import { UserProgress } from '../types';
import { getUserProgress } from '../firebase/firestore';
import { getDummyDataManager } from '../utils/dummyDataManager';
import toast from 'react-hot-toast';
import { LogOut, Heart, Brain, Database } from 'lucide-react';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [progress, setProgress] = useState<UserProgress>({
    completedDays: 0,
    totalDays: 20,
    startDate: new Date().toISOString().split('T')[0],
    completedDates: []
  });
  const [activeTab, setActiveTab] = useState<'tracking' | 'prediction'>('tracking');
  const [hasData, setHasData] = useState(false);
  const [showDemoPrompt, setShowDemoPrompt] = useState(false);

  useEffect(() => {
    loadUserProgress();
  }, [user.uid]);

  const loadUserProgress = async () => {
    try {
      const userProgress = await getUserProgress(user.uid);
      if (userProgress) {
        setProgress(userProgress);
        setHasData(userProgress.completedDays > 0);
        
        // Show demo prompt if no data exists
        if (userProgress.completedDays === 0) {
          setTimeout(() => setShowDemoPrompt(true), 2000);
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      // Show demo prompt on error as well
      setTimeout(() => setShowDemoPrompt(true), 2000);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const updateProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    setHasData(newProgress.completedDays > 0);
  };

  const handleDataLoaded = () => {
    loadUserProgress();
    setShowDemoPrompt(false);
  };

  const handleLoadDemoData = async () => {
    const dummyManager = getDummyDataManager(user.uid);
    await dummyManager.loadDummyProfile('moderateRisk');
    handleDataLoaded();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Endometriosis Tracker
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Demo Data Prompt */}
      {showDemoPrompt && !hasData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Database className="h-6 w-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-blue-900">Welcome to the Demo!</h3>
                <p className="text-blue-800 mt-1">
                  It looks like you don't have any symptom data yet. Would you like to load some sample data to explore the features?
                </p>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleLoadDemoData}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Load Sample Data
                  </button>
                  <button
                    onClick={() => setShowDemoPrompt(false)}
                    className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Start Fresh
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowDemoPrompt(false)}
                className="text-blue-400 hover:text-blue-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tracking')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tracking'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Heart className="h-4 w-4 inline mr-2" />
              Symptom Tracking
            </button>
            <button
              onClick={() => setActiveTab('prediction')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prediction'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Brain className="h-4 w-4 inline mr-2" />
              AI Analysis
              {progress.completedDays >= 5 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Ready
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tracking' ? (
          <div className="space-y-8">
            {/* Progress Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Progress
              </h2>
              <ProgressBar progress={progress} />
            </div>

            {/* Calendar Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Daily Symptom Tracking
              </h2>
              <Calendar 
                userId={user.uid} 
                progress={progress}
                onProgressUpdate={updateProgress}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Prediction Dashboard */}
            <PredictionDashboard 
              user={user}
              completedDays={progress.completedDays}
            />

            {/* Progress Summary for Prediction Tab */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Data Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {progress.completedDays}
                  </div>
                  <div className="text-sm text-blue-800">Days Tracked</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((progress.completedDays / progress.totalDays) * 100)}%
                  </div>
                  <div className="text-sm text-green-800">Progress</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {progress.completedDays >= 5 ? 'Ready' : 'Pending'}
                  </div>
                  <div className="text-sm text-purple-800">AI Analysis</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Dummy Data Panel - Only show in development or for demo */}
      <DummyDataPanel user={user} onDataLoaded={handleDataLoaded} />
    </div>
  );
};

export default Dashboard;