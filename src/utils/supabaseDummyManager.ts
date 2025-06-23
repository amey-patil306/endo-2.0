import { saveSymptomEntry, updateUserProgress, getUserProgress } from '../lib/database';
import { getMayDummyData, mayScenarios } from './mayDummyData';
import { SymptomEntry, UserProgress } from '../types';
import toast from 'react-hot-toast';

export class SupabaseDummyManager {
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

  // Load May 2024 dummy data for specific scenario (limited to 20 days)
  async loadMayScenario(scenario: 'highRisk' | 'moderateRisk' | 'lowRisk'): Promise<void> {
    try {
      const scenarioData = mayScenarios[scenario];
      toast.loading(`Loading ${scenarioData.name}...`);

      const { entries, progress } = scenarioData.generator(this.userId);
      
      // Limit to 20 days
      const limitedEntries = entries.slice(0, 20);
      
      // Save all entries in batches to avoid overwhelming the database
      const batchSize = 5;
      for (let i = 0; i < limitedEntries.length; i += batchSize) {
        const batch = limitedEntries.slice(i, i + batchSize);
        await Promise.all(batch.map(entry => saveSymptomEntry(this.userId, entry)));
        
        // Show progress
        const progressPercent = Math.round(((i + batch.length) / limitedEntries.length) * 100);
        toast.loading(`Loading ${scenarioData.name}... ${progressPercent}%`);
      }

      // Update progress with 20-day limit
      const limitedProgress: UserProgress = {
        ...progress,
        totalDays: 20,
        completedDays: Math.min(limitedEntries.length, 20),
        completedDates: limitedEntries.map(e => e.date).slice(0, 20)
      };

      await updateUserProgress(this.userId, limitedProgress);

      toast.dismiss();
      toast.success(`${scenarioData.name} loaded successfully! (${limitedEntries.length} days)`);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to load May 2024 data');
      console.error('Error loading May data:', error);
    }
  }

  // Load custom May data with specific parameters (limited to 20 days)
  async loadCustomMayData(options: {
    riskLevel?: 'high' | 'moderate' | 'low';
    symptomIntensity?: number; // 0-1 scale
    includeNotes?: boolean;
  } = {}): Promise<void> {
    try {
      const { riskLevel = 'moderate', symptomIntensity = 0.5, includeNotes = true } = options;
      
      toast.loading('Generating custom May 2024 data...');

      const { entries: baseEntries, progress } = getMayDummyData(
        riskLevel === 'high' ? 'highRisk' : riskLevel === 'low' ? 'lowRisk' : 'moderateRisk',
        this.userId
      );

      // Limit to 20 days
      const limitedBaseEntries = baseEntries.slice(0, 20);

      // Adjust symptom intensity
      const adjustedEntries = limitedBaseEntries.map(entry => {
        const adjustedEntry = { ...entry };
        
        // Randomly reduce symptoms based on intensity
        Object.keys(adjustedEntry).forEach(key => {
          if (typeof adjustedEntry[key as keyof SymptomEntry] === 'boolean' && key !== 'date' && key !== 'timestamp') {
            if (adjustedEntry[key as keyof SymptomEntry] && Math.random() > symptomIntensity) {
              (adjustedEntry as any)[key] = false;
            }
          }
        });

        // Handle notes
        if (!includeNotes) {
          adjustedEntry.notes = '';
        }

        return adjustedEntry;
      });

      // Save entries
      for (const entry of adjustedEntries) {
        await saveSymptomEntry(this.userId, entry);
      }

      // Update progress with 20-day limit
      const limitedProgress: UserProgress = {
        ...progress,
        totalDays: 20,
        completedDays: Math.min(adjustedEntries.length, 20),
        completedDates: adjustedEntries.map(e => e.date).slice(0, 20)
      };

      await updateUserProgress(this.userId, limitedProgress);

      toast.dismiss();
      toast.success(`Custom May 2024 data loaded! (${adjustedEntries.length} days)`);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate custom May data');
      console.error('Error generating custom May data:', error);
    }
  }

  // Clear all user data and reset to new 20-day period
  async clearAllData(): Promise<void> {
    try {
      toast.loading('Clearing all data...');

      // Reset progress to start new 20-day period
      const emptyProgress: UserProgress = {
        completedDays: 0,
        totalDays: 20,
        startDate: new Date().toISOString().split('T')[0],
        completedDates: []
      };

      await updateUserProgress(this.userId, emptyProgress);

      toast.dismiss();
      toast.success('All data cleared successfully! Ready for new 20-day tracking period.');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to clear data');
      console.error('Error clearing data:', error);
    }
  }

  // Add additional random days to existing data (respecting 20-day limit)
  async addRandomDays(numberOfDays: number = 5): Promise<void> {
    try {
      const currentProgress = await getUserProgress(this.userId);
      if (!currentProgress) return;

      // Check if we're already at the 20-day limit
      if (currentProgress.completedDays >= 20) {
        toast.error('Already at 20-day limit! Start a new month to continue tracking.');
        return;
      }

      // Limit additional days to not exceed 20 total
      const maxAdditionalDays = 20 - currentProgress.completedDays;
      const actualDaysToAdd = Math.min(numberOfDays, maxAdditionalDays);

      toast.loading(`Adding ${actualDaysToAdd} random days...`);

      // Generate random entries for recent dates
      const entries: SymptomEntry[] = [];
      const today = new Date();
      
      for (let i = 0; i < actualDaysToAdd; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i - 1);
        const dateString = date.toISOString().split('T')[0];
        
        // Skip if date already exists
        if (currentProgress.completedDates.includes(dateString)) continue;
        
        const entry: SymptomEntry = {
          irregularPeriods: Math.random() < 0.2,
          cramping: Math.random() < 0.4,
          menstrualClots: Math.random() < 0.3,
          infertility: Math.random() < 0.1,
          chronicPain: Math.random() < 0.3,
          diarrhea: Math.random() < 0.25,
          longMenstruation: Math.random() < 0.2,
          vomiting: Math.random() < 0.15,
          migraines: Math.random() < 0.3,
          extremeBloating: Math.random() < 0.4,
          legPain: Math.random() < 0.25,
          depression: Math.random() < 0.2,
          fertilityIssues: Math.random() < 0.15,
          ovarianCysts: Math.random() < 0.2,
          painfulUrination: Math.random() < 0.15,
          painAfterIntercourse: Math.random() < 0.2,
          digestiveProblems: Math.random() < 0.3,
          anemia: Math.random() < 0.1,
          hipPain: Math.random() < 0.2,
          vaginalPain: Math.random() < 0.2,
          cysts: Math.random() < 0.15,
          abnormalBleeding: Math.random() < 0.2,
          hormonalProblems: Math.random() < 0.25,
          feelingSick: Math.random() < 0.2,
          abdominalCrampsIntercourse: Math.random() < 0.15,
          insomnia: Math.random() < 0.25,
          lossOfAppetite: Math.random() < 0.15,
          notes: Math.random() < 0.5 ? 'Random symptom day' : '',
          date: dateString,
          timestamp: date.getTime(),
        };
        
        entries.push(entry);
      }

      // Save new entries
      for (const entry of entries) {
        await saveSymptomEntry(this.userId, entry);
      }

      // Update progress with 20-day limit enforcement
      const newCompletedDays = Math.min(currentProgress.completedDays + entries.length, 20);
      const updatedProgress: UserProgress = {
        ...currentProgress,
        totalDays: 20,
        completedDays: newCompletedDays,
        completedDates: [
          ...currentProgress.completedDates,
          ...entries.map(e => e.date)
        ].slice(0, 20) // Ensure we don't exceed 20 dates
      };

      await updateUserProgress(this.userId, updatedProgress);

      toast.dismiss();
      if (newCompletedDays >= 20) {
        toast.success(`Added ${entries.length} days! 20-day tracking period complete!`);
      } else {
        toast.success(`Added ${entries.length} random days! ${20 - newCompletedDays} days remaining.`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to add random days');
      console.error('Error adding random days:', error);
    }
  }

  // Start a new 20-day tracking period
  async startNewMonth(): Promise<void> {
    try {
      toast.loading('Starting new 20-day tracking period...');

      const newProgress: UserProgress = {
        completedDays: 0,
        totalDays: 20,
        startDate: new Date().toISOString().split('T')[0],
        completedDates: []
      };

      await updateUserProgress(this.userId, newProgress);

      toast.dismiss();
      toast.success('New 20-day tracking period started!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to start new tracking period');
      console.error('Error starting new month:', error);
    }
  }
}

// Utility function to get Supabase dummy data manager instance
export const getSupabaseDummyManager = (userId: string) => new SupabaseDummyManager(userId);