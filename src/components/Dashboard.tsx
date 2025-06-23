import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import Calendar from './Calendar';
import ProgressBar from './ProgressBar';
import { UserProgress } from '../types';
import { getUserProgress } from '../firebase/firestore';
import toast from 'react-hot-toast';
import { LogOut, Heart } from 'lucide-react';

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

  useEffect(() => {
    loadUserProgress();
  }, [user.uid]);

  const loadUserProgress = async () => {
    try {
      const userProgress = await getUserProgress(user.uid);
      if (userProgress) {
        setProgress(userProgress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
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
                  Symptom Tracker
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>
    </div>
  );
};

export default Dashboard;