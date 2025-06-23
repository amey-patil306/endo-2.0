import { saveSymptomEntry, updateUserProgress, getUserProgress } from '../firebase/firestore';
import { generateDummySymptomEntries, generateDummyUserProgress, dummyUserProfiles } from './dummyData';
import { SymptomEntry, UserProgress } from '../types';
import toast from 'react-hot-toast';

export class DummyDataManager {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Check if user has any existing data
  async hasExistingData(): Promise<boolean> {
    try {
      const progress = await getUserProgress(this.userId);
      return progress ? progress.completedDays > 0 : false;
    } catch (error) {
      console.error('Error checking existing data:', error);
      return false;
    }
  }

  // Load dummy data for a specific profile
  async loadDummyProfile(profileType: 'highRisk' | 'moderateRisk' | 'lowRisk'): Promise<void> {
    try {
      const profile = dummyUserProfiles[profileType];
      const entries = profile.entries(this.userId);
      
      toast.loading(`Loading ${profile.name} data...`);

      // Save all entries
      for (const entry of entries) {
        await saveSymptomEntry(this.userId, entry);
      }

      // Update progress
      const progress = generateDummyUserProgress(entries.length);
      await updateUserProgress(this.userId, progress);

      toast.dismiss();
      toast.success(`${profile.name} data loaded successfully!`);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to load dummy data');
      console.error('Error loading dummy data:', error);
    }
  }

  // Load random dummy data
  async loadRandomDummyData(numberOfDays: number = 15): Promise<void> {
    try {
      toast.loading('Generating sample data...');

      const entries = generateDummySymptomEntries(this.userId, numberOfDays);
      
      // Save all entries
      for (const entry of entries) {
        await saveSymptomEntry(this.userId, entry);
      }

      // Update progress
      const progress = generateDummyUserProgress(entries.length);
      await updateUserProgress(this.userId, progress);

      toast.dismiss();
      toast.success(`${numberOfDays} days of sample data loaded!`);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate sample data');
      console.error('Error generating dummy data:', error);
    }
  }

  // Clear all user data
  async clearAllData(): Promise<void> {
    try {
      toast.loading('Clearing all data...');

      // Reset progress
      const emptyProgress: UserProgress = {
        completedDays: 0,
        totalDays: 20,
        startDate: new Date().toISOString().split('T')[0],
        completedDates: []
      };

      await updateUserProgress(this.userId, emptyProgress);

      toast.dismiss();
      toast.success('All data cleared successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to clear data');
      console.error('Error clearing data:', error);
    }
  }

  // Add a few more days of data
  async addMoreDummyData(additionalDays: number = 5): Promise<void> {
    try {
      const currentProgress = await getUserProgress(this.userId);
      if (!currentProgress) return;

      toast.loading(`Adding ${additionalDays} more days...`);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - additionalDays);

      const newEntries = generateDummySymptomEntries(this.userId, additionalDays);
      
      for (const entry of newEntries) {
        await saveSymptomEntry(this.userId, entry);
      }

      // Update progress
      const updatedProgress: UserProgress = {
        ...currentProgress,
        completedDays: currentProgress.completedDays + additionalDays,
        completedDates: [
          ...currentProgress.completedDates,
          ...newEntries.map(e => e.date)
        ]
      };

      await updateUserProgress(this.userId, updatedProgress);

      toast.dismiss();
      toast.success(`Added ${additionalDays} more days of data!`);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to add more data');
      console.error('Error adding more data:', error);
    }
  }
}

// Utility function to get dummy data manager instance
export const getDummyDataManager = (userId: string) => new DummyDataManager(userId);