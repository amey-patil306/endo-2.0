import React from 'react';
import { UserProgress } from '../types';
import { CheckCircle, Calendar } from 'lucide-react';

interface ProgressBarProps {
  progress: UserProgress;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const percentage = (progress.completedDays / progress.totalDays) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">
            {progress.completedDays} of {progress.totalDays} days completed
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">
            Started: {new Date(progress.startDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="text-center">
        <span className="text-2xl font-bold text-primary-600">
          {Math.round(percentage)}%
        </span>
        <p className="text-sm text-gray-600 mt-1">
          {progress.completedDays >= progress.totalDays 
            ? 'Congratulations! You\'ve completed your tracking period.' 
            : `${progress.totalDays - progress.completedDays} days remaining`
          }
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;