import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { signOut } from '../lib/auth';
import Calendar from './Calendar';
import ProgressBar from './ProgressBar';
import PredictionDashboard from './PredictionDashboard';
import SupabaseDemoPanel from './SupabaseDemoPanel';
import { UserProgress } from '../types';
import { getUserProgress, subscribeToUserProgress, updateUserProgress, getAvailableMonths } from '../lib/database';
import { getSupabaseDummyManager } from '../utils/supabaseDummyManager';
import toast from 'react-hot-toast';
import { LogOut, Heart, Brain, Database, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [progress, setProgress] = useState<UserProgress>({
    completedDays: 0,
    totalDays: 20, // Fixed to 20 days
    startDate: new Date().toISOString().split('T')[0],
    completedDates: []
  });
  const [activeTab, setActiveTab] = useState<'tracking' | 'prediction'>('tracking');
  const [hasData, setHasData] = useState(false);
  const [showDemoPrompt, setShowDemoPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  // Get current month key
  const getCurrentMonthKey = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Format month key for display
  const formatMonthDisplay = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  useEffect(() => {
    loadUserProgress();
    loadAvailableMonths();
    
    // Subscribe to real-time progress updates
    const subscription = subscribeToUserProgress(user.id, (updatedProgress) => {
      if (updatedProgress) {
        setProgress(updatedProgress);
        setHasData(updatedProgress.completedDays > 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  const loadUserProgress = async () => {
    try {
      setLoading(true);
      const userProgress = await getUserProgress(user.id);
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
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMonths = async () => {
    try {
      const months = await getAvailableMonths(user.id);
      setAvailableMonths(months);
      
      // Set current month as selected by default
      const currentMonth = getCurrentMonthKey();
      setSelectedMonth(currentMonth);
    } catch (error) {
      console.error('Error loading available months:', error);
      setSelectedMonth(getCurrentMonthKey());
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
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
    loadAvailableMonths();
    setShowDemoPrompt(false);
  };

  const handleLoadMayDemo = async () => {
    const dummyManager = getSupabaseDummyManager(user.id);
    await dummyManager.loadMayScenario('moderateRisk');
    handleDataLoaded();
  };

  const handleNewMonth = async () => {
    try {
      const newProgress: UserProgress = {
        completedDays: 0,
        totalDays: 20,
        startDate: new Date().toISOString().split('T')[0],
        completedDates: []
      };
      
      await updateUserProgress(user.id, newProgress);
      setProgress(newProgress);
      setHasData(false);
      
      // Reload available months
      await loadAvailableMonths();
      
      toast.success('New month started! Begin tracking your symptoms.');
    } catch (error) {
      console.error('Error starting new month:', error);
      toast.error('Failed to start new month');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min((progress.completedDays / progress.totalDays) * 100, 100);
  const canPredict = progress.completedDays >= 5; // Minimum 5 days for prediction
  const isComplete = progress.completedDays >= progress.totalDays;

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
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-600">
                    Welcome back, {user.email}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Monthly Tracking
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Month Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowMonthSelector(!showMonthSelector)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <CalendarIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {formatMonthDisplay(selectedMonth)}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {showMonthSelector && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      {availableMonths.map((month) => (
                        <button
                          key={month}
                          onClick={() => {
                            setSelectedMonth(month);
                            setShowMonthSelector(false);
                            // Reload data for selected month if needed
                            if (month !== getCurrentMonthKey()) {
                              toast.info(`Viewing data for ${formatMonthDisplay(month)}`);
                            }
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            month === selectedMonth ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                          }`}
                        >
                          {formatMonthDisplay(month)}
                          {month === getCurrentMonthKey() && (
                            <span className="ml-2 text-xs text-green-600">(Current)</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
        </div>
      </header>

      {/* Demo Data Prompt */}
      {showDemoPrompt && !hasData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <CalendarIcon className="h-8 w-8 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-blue-900">Welcome to Monthly Health Tracking!</h3>
                <p className="text-blue-800 mt-2">
                  Track your symptoms for up to 20 days each month to get AI-powered insights. Data is organized by month 
                  for better pattern analysis. We've prepared sample data to help you explore all features.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={handleLoadMayDemo}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Load Sample Month Data
                  </button>
                  <button
                    onClick={() => setShowDemoPrompt(false)}
                    className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-300 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Start Fresh
                  </button>
                </div>
                <p className="text-sm text-blue-600 mt-3">
                  💡 Monthly tracking helps identify patterns and provides more accurate analysis
                </p>
              </div>
              <button
                onClick={() => setShowDemoPrompt(false)}
                className="text-blue-400 hover:text-blue-600 text-xl"
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
              Monthly Tracking
              {hasData && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {Math.min(progress.completedDays, 20)}/20 days
                </span>
              )}
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
              Monthly Analysis
              {canPredict && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Ready
                </span>
              )}
              {isComplete && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Complete
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Monthly Progress ({formatMonthDisplay(selectedMonth)})
                </h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Database className="h-4 w-4 mr-1" />
                  Real-time sync
                </div>
              </div>
              <ProgressBar progress={progress} onNewMonth={handleNewMonth} />
            </div>

            {/* Calendar Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Daily Symptom Tracking - {formatMonthDisplay(selectedMonth)}
              </h2>
              <Calendar 
                userId={user.id} 
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
              completedDays={Math.min(progress.completedDays, 20)}
              isComplete={isComplete}
              selectedMonth={selectedMonth}
            />

            {/* Progress Summary for Prediction Tab */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Data Summary - {formatMonthDisplay(selectedMonth)}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.min(progress.completedDays, 20)}
                  </div>
                  <div className="text-sm text-blue-800">Days Tracked</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-sm text-green-800">Monthly Progress</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {canPredict ? 'Ready' : 'Pending'}
                  </div>
                  <div className="text-sm text-purple-800">Analysis Status</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-600">
                    {availableMonths.length}
                  </div>
                  <div className="text-sm text-indigo-800">Months Tracked</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Supabase Demo Panel */}
      <SupabaseDemoPanel user={user} onDataLoaded={handleDataLoaded} />
    </div>
  );
};

export default Dashboard;