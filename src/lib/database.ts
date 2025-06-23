import { supabase, SymptomEntryDB, UserProgressDB } from './supabase';
import { SymptomEntry, UserProgress } from '../types';
import { auth } from '../firebase/config';

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

// Ensure user is authenticated
const ensureAuthenticated = (): string => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated. Please sign in first.');
  }
  return auth.currentUser.uid;
};

// Save symptom entry
export const saveSymptomEntry = async (userId: string, entry: SymptomEntry): Promise<void> => {
  const currentUserId = ensureAuthenticated();
  if (currentUserId !== userId) {
    throw new Error('User ID mismatch. Please sign in again.');
  }

  const dbEntry = transformToDBFormat(entry, userId);

  const { error } = await supabase
    .from('symptom_entries')
    .upsert(dbEntry, { 
      onConflict: 'user_id,date',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('Supabase save error:', error);
    throw new Error(`Failed to save entry: ${error.message}`);
  }
};

// Get symptom entry for a specific date
export const getSymptomEntry = async (userId: string, date: string): Promise<SymptomEntry | null> => {
  const currentUserId = ensureAuthenticated();
  if (currentUserId !== userId) {
    throw new Error('User ID mismatch. Please sign in again.');
  }

  const { data, error } = await supabase
    .from('symptom_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No data found
      return null;
    }
    console.error('Supabase get error:', error);
    throw new Error(`Failed to get entry: ${error.message}`);
  }

  return data ? transformFromDBFormat(data) : null;
};

// Get all symptom entries for a user
export const getAllSymptomEntries = async (userId: string): Promise<SymptomEntry[]> => {
  const currentUserId = ensureAuthenticated();
  if (currentUserId !== userId) {
    throw new Error('User ID mismatch. Please sign in again.');
  }

  const { data, error } = await supabase
    .from('symptom_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) {
    console.error('Supabase get all error:', error);
    throw new Error(`Failed to get entries: ${error.message}`);
  }

  return data ? data.map(transformFromDBFormat) : [];
};

// Update user progress
export const updateUserProgress = async (userId: string, progress: UserProgress): Promise<void> => {
  const currentUserId = ensureAuthenticated();
  if (currentUserId !== userId) {
    throw new Error('User ID mismatch. Please sign in again.');
  }

  const dbProgress: UserProgressDB = {
    user_id: userId,
    completed_days: progress.completedDays,
    total_days: progress.totalDays,
    start_date: progress.startDate,
    completed_dates: progress.completedDates,
  };

  const { error } = await supabase
    .from('user_progress')
    .upsert(dbProgress, { 
      onConflict: 'user_id',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('Supabase progress update error:', error);
    throw new Error(`Failed to update progress: ${error.message}`);
  }
};

// Get user progress
export const getUserProgress = async (userId: string): Promise<UserProgress | null> => {
  const currentUserId = ensureAuthenticated();
  if (currentUserId !== userId) {
    throw new Error('User ID mismatch. Please sign in again.');
  }

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No data found, create default progress
      const defaultProgress: UserProgress = {
        completedDays: 0,
        totalDays: 20,
        startDate: new Date().toISOString().split('T')[0],
        completedDates: []
      };
      
      await updateUserProgress(userId, defaultProgress);
      return defaultProgress;
    }
    console.error('Supabase get progress error:', error);
    return null;
  }

  return {
    completedDays: data.completed_days,
    totalDays: data.total_days,
    startDate: data.start_date,
    completedDates: data.completed_dates
  };
};

// Get symptom entries for ML prediction
export const getSymptomEntriesForPrediction = async (userId: string): Promise<any[]> => {
  const entries = await getAllSymptomEntries(userId);
  
  return entries.map(entry => ({
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

// Subscribe to real-time changes for symptom entries
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
        // Fetch updated data when changes occur
        const entries = await getAllSymptomEntries(userId);
        callback(entries);
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
        // Fetch updated data when changes occur
        const progress = await getUserProgress(userId);
        callback(progress);
      }
    )
    .subscribe();
};