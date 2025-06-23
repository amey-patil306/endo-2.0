import { supabase, SymptomEntryDB, UserProgressDB } from './supabase';
import { SymptomEntry, UserProgress } from '../types';
import { getCurrentUser } from './auth';
import { ensureTablesExist } from './supabaseSetup';

// Transform frontend SymptomEntry to database format
const transformToDBFormat = (entry: SymptomEntry, userId: string): SymptomEntryDB => ({
  user_id: userId,
  date: entry.date,
  irregular_periods: entry.irregularPeriods,
  cramping: entry.cramping,
  menstrual_clots: entry.menstrualClots,
  infertility: entry.infertility,
  chronic_pain: entry.chronicPain,
  diarrhea: entry.diarrhea,
  long_menstruation: entry.longMenstruation,
  vomiting: entry.vomiting,
  migraines: entry.migraines,
  extreme_bloating: entry.extremeBloating,
  leg_pain: entry.legPain,
  depression: entry.depression,
  fertility_issues: entry.fertilityIssues,
  ovarian_cysts: entry.ovarianCysts,
  painful_urination: entry.painfulUrination,
  pain_after_intercourse: entry.painAfterIntercourse,
  digestive_problems: entry.digestiveProblems,
  anemia: entry.anemia,
  hip_pain: entry.hipPain,
  vaginal_pain: entry.vaginalPain,
  cysts: entry.cysts,
  abnormal_bleeding: entry.abnormalBleeding,
  hormonal_problems: entry.hormonalProblems,
  feeling_sick: entry.feelingSick,
  abdominal_cramps_intercourse: entry.abdominalCrampsIntercourse,
  insomnia: entry.insomnia,
  loss_of_appetite: entry.lossOfAppetite,
  notes: entry.notes,
});

// Transform database format to frontend SymptomEntry
const transformFromDBFormat = (dbEntry: SymptomEntryDB): SymptomEntry => ({
  irregularPeriods: dbEntry.irregular_periods,
  cramping: dbEntry.cramping,
  menstrualClots: dbEntry.menstrual_clots,
  infertility: dbEntry.infertility,
  chronicPain: dbEntry.chronic_pain,
  diarrhea: dbEntry.diarrhea,
  longMenstruation: dbEntry.long_menstruation,
  vomiting: dbEntry.vomiting,
  migraines: dbEntry.migraines,
  extremeBloating: dbEntry.extreme_bloating,
  legPain: dbEntry.leg_pain,
  depression: dbEntry.depression,
  fertilityIssues: dbEntry.fertility_issues,
  ovarianCysts: dbEntry.ovarian_cysts,
  painfulUrination: dbEntry.painful_urination,
  painAfterIntercourse: dbEntry.pain_after_intercourse,
  digestiveProblems: dbEntry.digestive_problems,
  anemia: dbEntry.anemia,
  hipPain: dbEntry.hip_pain,
  vaginalPain: dbEntry.vaginal_pain,
  cysts: dbEntry.cysts,
  abnormalBleeding: dbEntry.abnormal_bleeding,
  hormonalProblems: dbEntry.hormonal_problems,
  feelingSick: dbEntry.feeling_sick,
  abdominalCrampsIntercourse: dbEntry.abdominal_cramps_intercourse,
  insomnia: dbEntry.insomnia,
  lossOfAppetite: dbEntry.loss_of_appetite,
  notes: dbEntry.notes,
  date: dbEntry.date,
  timestamp: new Date(dbEntry.created_at || dbEntry.date).getTime(),
});

// Get current month key (YYYY-MM format)
const getCurrentMonthKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Get month key from date string
const getMonthKeyFromDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// Get start and end dates for a month
const getMonthDateRange = (monthKey: string): { startDate: string; endDate: string } => {
  const [year, month] = monthKey.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

// Ensure user is authenticated
const ensureAuthenticated = async (): Promise<string> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated. Please sign in first.');
  }
  return user.id;
};

// Enhanced error handling for Supabase operations
const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase ${operation} error:`, error);
  
  if (error.code === '42501') {
    throw new Error('Permission denied. Please make sure you are properly authenticated.');
  }
  
  if (error.code === '42P01') {
    throw new Error(`Database table not found. Please ensure the database is properly set up. Missing table for ${operation}.`);
  }
  
  if (error.code === '23505') {
    throw new Error('Data already exists for this date. Use update instead.');
  }
  
  if (error.message?.includes('JWT')) {
    throw new Error('Authentication token expired. Please sign in again.');
  }
  
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    throw new Error('Network error. Please check your internet connection.');
  }
  
  throw new Error(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
};

// Ensure tables exist before operations
const ensureTablesExistForOperation = async (operation: string): Promise<void> => {
  try {
    const result = await ensureTablesExist();
    if (!result.success) {
      throw new Error(`Cannot ${operation}: Required database tables are missing. Please check your Supabase setup.`);
    }
  } catch (error) {
    console.error(`Error ensuring tables exist for ${operation}:`, error);
    throw new Error(`Database setup error: ${error}`);
  }
};

// Save symptom entry with better error handling
export const saveSymptomEntry = async (userId: string, entry: SymptomEntry): Promise<void> => {
  try {
    // Verify user is authenticated
    const currentUserId = await ensureAuthenticated();
    if (currentUserId !== userId) {
      throw new Error('User ID mismatch. Please sign in again.');
    }

    // Ensure tables exist
    await ensureTablesExistForOperation('save symptom entry');

    console.log('💾 Saving symptom entry:', { userId, date: entry.date });

    const dbEntry = transformToDBFormat(entry, userId);

    // First try to insert, if conflict then update
    const { data, error } = await supabase
      .from('symptom_entries')
      .upsert(dbEntry, { 
        onConflict: 'user_id,date',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      handleSupabaseError(error, 'save entry');
    }

    console.log('✅ Successfully saved symptom entry:', data);
  } catch (error: any) {
    console.error('Save symptom entry error:', error);
    throw error;
  }
};

// Get symptom entry for a specific date
export const getSymptomEntry = async (userId: string, date: string): Promise<SymptomEntry | null> => {
  try {
    const currentUserId = await ensureAuthenticated();
    if (currentUserId !== userId) {
      throw new Error('User ID mismatch. Please sign in again.');
    }

    // Ensure tables exist
    await ensureTablesExistForOperation('get symptom entry');

    const { data, error } = await supabase
      .from('symptom_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      console.error('Supabase get error:', error);
      handleSupabaseError(error, 'get entry');
    }

    return data ? transformFromDBFormat(data) : null;
  } catch (error: any) {
    console.error('Get symptom entry error:', error);
    throw error;
  }
};

// Get all symptom entries for a user for current month (limited to 20 most recent)
export const getAllSymptomEntries = async (userId: string): Promise<SymptomEntry[]> => {
  try {
    const currentUserId = await ensureAuthenticated();
    if (currentUserId !== userId) {
      throw new Error('User ID mismatch. Please sign in again.');
    }

    // Ensure tables exist
    await ensureTablesExistForOperation('get symptom entries');

    // Get current month's data
    const currentMonth = getCurrentMonthKey();
    const { startDate, endDate } = getMonthDateRange(currentMonth);

    console.log(`📅 Getting entries for current month: ${currentMonth} (${startDate} to ${endDate})`);

    const { data, error } = await supabase
      .from('symptom_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .limit(20); // Limit to 20 most recent entries

    if (error) {
      console.error('Supabase get all error:', error);
      handleSupabaseError(error, 'get entries');
    }

    const entries = data ? data.map(transformFromDBFormat).reverse() : []; // Reverse to get chronological order
    console.log(`📊 Found ${entries.length} entries for current month`);
    
    return entries;
  } catch (error: any) {
    console.error('Get all symptom entries error:', error);
    throw error;
  }
};

// Get symptom entries for a specific month
export const getSymptomEntriesForMonth = async (userId: string, monthKey: string): Promise<SymptomEntry[]> => {
  try {
    const currentUserId = await ensureAuthenticated();
    if (currentUserId !== userId) {
      throw new Error('User ID mismatch. Please sign in again.');
    }

    // Ensure tables exist
    await ensureTablesExistForOperation('get symptom entries for month');

    const { startDate, endDate } = getMonthDateRange(monthKey);

    console.log(`📅 Getting entries for month: ${monthKey} (${startDate} to ${endDate})`);

    const { data, error } = await supabase
      .from('symptom_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Supabase get month entries error:', error);
      handleSupabaseError(error, 'get month entries');
    }

    const entries = data ? data.map(transformFromDBFormat) : [];
    console.log(`📊 Found ${entries.length} entries for month ${monthKey}`);
    
    return entries;
  } catch (error: any) {
    console.error('Get symptom entries for month error:', error);
    throw error;
  }
};

// Update user progress with 20-day limit enforcement for current month
export const updateUserProgress = async (userId: string, progress: UserProgress): Promise<void> => {
  try {
    const currentUserId = await ensureAuthenticated();
    if (currentUserId !== userId) {
      throw new Error('User ID mismatch. Please sign in again.');
    }

    // Ensure tables exist
    await ensureTablesExistForOperation('update user progress');

    console.log('📈 Updating user progress:', { userId, progress });

    // Get current month
    const currentMonth = getCurrentMonthKey();
    
    // Enforce 20-day limit for current month
    const limitedProgress = {
      ...progress,
      totalDays: 20, // Always enforce 20-day limit
      completedDays: Math.min(progress.completedDays, 20),
      completedDates: progress.completedDates
        .filter(date => getMonthKeyFromDate(date) === currentMonth) // Only current month dates
        .slice(0, 20) // Limit to first 20 dates
    };

    const dbProgress: UserProgressDB = {
      user_id: userId,
      completed_days: limitedProgress.completedDays,
      total_days: limitedProgress.totalDays,
      start_date: limitedProgress.startDate,
      completed_dates: limitedProgress.completedDates,
    };

    const { data, error } = await supabase
      .from('user_progress')
      .upsert(dbProgress, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase progress update error:', error);
      handleSupabaseError(error, 'update progress');
    }

    console.log('✅ Successfully updated user progress:', data);
  } catch (error: any) {
    console.error('Update user progress error:', error);
    throw error;
  }
};

// Get user progress with 20-day limit enforcement for current month
export const getUserProgress = async (userId: string): Promise<UserProgress | null> => {
  try {
    const currentUserId = await ensureAuthenticated();
    if (currentUserId !== userId) {
      throw new Error('User ID mismatch. Please sign in again.');
    }

    // Ensure tables exist
    await ensureTablesExistForOperation('get user progress');

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Supabase get progress error:', error);
      handleSupabaseError(error, 'get progress');
    }

    const currentMonth = getCurrentMonthKey();

    if (!data) {
      // Create default progress if none exists
      const defaultProgress: UserProgress = {
        completedDays: 0,
        totalDays: 20, // Always 20 days
        startDate: new Date().toISOString().split('T')[0],
        completedDates: []
      };
      
      await updateUserProgress(userId, defaultProgress);
      return defaultProgress;
    }

    // Get actual current month entries to sync progress
    const currentMonthEntries = await getAllSymptomEntries(userId);
    const currentMonthDates = currentMonthEntries.map(entry => entry.date);

    // Create progress based on actual current month data
    const syncedProgress: UserProgress = {
      completedDays: Math.min(currentMonthDates.length, 20),
      totalDays: 20, // Always enforce 20-day limit
      startDate: data.start_date,
      completedDates: currentMonthDates.slice(0, 20) // Limit to first 20 dates
    };

    console.log(`📊 User progress for month ${currentMonth}:`, syncedProgress);
    
    // Update the database with synced progress if different
    if (syncedProgress.completedDays !== data.completed_days || 
        JSON.stringify(syncedProgress.completedDates) !== JSON.stringify(data.completed_dates)) {
      console.log('🔄 Syncing progress with actual data...');
      await updateUserProgress(userId, syncedProgress);
    }
    
    return syncedProgress;
  } catch (error: any) {
    console.error('Get user progress error:', error);
    throw error;
  }
};

// Get symptom entries for ML prediction (limited to 20 days from current month)
export const getSymptomEntriesForPrediction = async (userId: string): Promise<any[]> => {
  const entries = await getAllSymptomEntries(userId);
  
  // Limit to 20 most recent entries for prediction
  const limitedEntries = entries.slice(0, 20);
  
  return limitedEntries.map(entry => ({
    'Irregular / Missed periods': entry.irregularPeriods ? 1 : 0,
    'Cramping': entry.cramping ? 1 : 0,
    'Menstrual clots': entry.menstrualClots ? 1 : 0,
    'Infertility': entry.infertility ? 1 : 0,
    'Pain / Chronic pain': entry.chronicPain ? 1 : 0,
    'Diarrhea': entry.diarrhea ? 1 : 0,
    'Long menstruation': entry.longMenstruation ? 1 : 0,
    'Vomiting / constant vomiting': entry.vomiting ? 1 : 0,
    'Migraines': entry.migraines ? 1 : 0,
    'Extreme Bloating': entry.extremeBloating ? 1 : 0,
    'Leg pain': entry.legPain ? 1 : 0,
    'Depression': entry.depression ? 1 : 0,
    'Fertility Issues': entry.fertilityIssues ? 1 : 0,
    'Ovarian cysts': entry.ovarianCysts ? 1 : 0,
    'Painful urination': entry.painfulUrination ? 1 : 0,
    'Pain after Intercourse': entry.painAfterIntercourse ? 1 : 0,
    'Digestive / GI problems': entry.digestiveProblems ? 1 : 0,
    'Anaemia / Iron deficiency': entry.anemia ? 1 : 0,
    'Hip pain': entry.hipPain ? 1 : 0,
    'Vaginal Pain/Pressure': entry.vaginalPain ? 1 : 0,
    'Cysts (unspecified)': entry.cysts ? 1 : 0,
    'Abnormal uterine bleeding': entry.abnormalBleeding ? 1 : 0,
    'Hormonal problems': entry.hormonalProblems ? 1 : 0,
    'Feeling sick': entry.feelingSick ? 1 : 0,
    'Abdominal Cramps during Intercourse': entry.abdominalCrampsIntercourse ? 1 : 0,
    'Insomnia / Sleeplessness': entry.insomnia ? 1 : 0,
    'Loss of appetite': entry.lossOfAppetite ? 1 : 0,
    date: entry.date,
    notes: entry.notes
  }));
};

// Subscribe to real-time changes for symptom entries (current month only)
export const subscribeToSymptomEntries = (userId: string, callback: (entries: SymptomEntry[]) => void) => {
  return supabase
    .channel('symptom_entries_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'symptom_entries',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        try {
          // Fetch updated data when changes occur (current month only)
          const entries = await getAllSymptomEntries(userId);
          callback(entries);
        } catch (error) {
          console.error('Error fetching updated entries:', error);
        }
      }
    )
    .subscribe();
};

// Subscribe to real-time changes for user progress
export const subscribeToUserProgress = (userId: string, callback: (progress: UserProgress | null) => void) => {
  return supabase
    .channel('user_progress_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_progress',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        try {
          // Fetch updated data when changes occur
          const progress = await getUserProgress(userId);
          callback(progress);
        } catch (error) {
          console.error('Error fetching updated progress:', error);
        }
      }
    )
    .subscribe();
};

// Get available months for user (for month selection)
export const getAvailableMonths = async (userId: string): Promise<string[]> => {
  try {
    const currentUserId = await ensureAuthenticated();
    if (currentUserId !== userId) {
      throw new Error('User ID mismatch. Please sign in again.');
    }

    const { data, error } = await supabase
      .from('symptom_entries')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase get available months error:', error);
      handleSupabaseError(error, 'get available months');
    }

    if (!data || data.length === 0) {
      return [getCurrentMonthKey()]; // Return current month if no data
    }

    // Extract unique months from dates
    const months = new Set<string>();
    data.forEach(entry => {
      const monthKey = getMonthKeyFromDate(entry.date);
      months.add(monthKey);
    });

    // Always include current month
    months.add(getCurrentMonthKey());

    // Sort months in descending order (most recent first)
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  } catch (error: any) {
    console.error('Get available months error:', error);
    return [getCurrentMonthKey()];
  }
};

// Test Supabase connection and table existence
export const testSupabaseConnection = async (): Promise<{
  connected: boolean;
  tablesExist: boolean;
  errors: string[];
}> => {
  try {
    console.log('🔍 Testing Supabase connection and tables...');
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('symptom_entries')
      .select('count')
      .limit(1);
    
    const connected = !connectionError;
    
    // Test table existence
    const tableResult = await ensureTablesExist();
    
    const result = {
      connected,
      tablesExist: tableResult.success,
      errors: tableResult.errors
    };
    
    if (connected && tableResult.success) {
      console.log('✅ Supabase connection and tables verified successfully');
    } else {
      console.warn('⚠️ Supabase issues detected:', result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return {
      connected: false,
      tablesExist: false,
      errors: [`Connection test failed: ${error}`]
    };
  }
};