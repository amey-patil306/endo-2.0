import { createClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.error('❌ VITE_SUPABASE_URL is not set in environment variables');
  console.error('Please add your Supabase URL to the .env file');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set in environment variables');
  console.error('Please add your Supabase anon key to the .env file');
}

// Create Supabase client with proper error handling
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'endometriosis-tracker'
      }
    }
  }
);

// Test connection on initialization with better error handling
const testInitialConnection = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl.includes('placeholder') || 
        supabaseAnonKey.includes('placeholder')) {
      console.warn('⚠️ Supabase not configured - using placeholder values');
      return;
    }

    const { data, error } = await supabase
      .from('symptom_entries')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('💡 Tables may not exist. Please run migrations in Supabase dashboard.');
      }
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
  }
};

// Run connection test
testInitialConnection();

// Database types
export interface SymptomEntryDB {
  id?: string;
  user_id: string;
  date: string;
  irregular_periods: boolean;
  cramping: boolean;
  menstrual_clots: boolean;
  infertility: boolean;
  chronic_pain: boolean;
  diarrhea: boolean;
  long_menstruation: boolean;
  vomiting: boolean;
  migraines: boolean;
  extreme_bloating: boolean;
  leg_pain: boolean;
  depression: boolean;
  fertility_issues: boolean;
  ovarian_cysts: boolean;
  painful_urination: boolean;
  pain_after_intercourse: boolean;
  digestive_problems: boolean;
  anemia: boolean;
  hip_pain: boolean;
  vaginal_pain: boolean;
  cysts: boolean;
  abnormal_bleeding: boolean;
  hormonal_problems: boolean;
  feeling_sick: boolean;
  abdominal_cramps_intercourse: boolean;
  insomnia: boolean;
  loss_of_appetite: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProgressDB {
  id?: string;
  user_id: string;
  completed_days: number;
  total_days: number;
  start_date: string;
  completed_dates: string[];
  created_at?: string;
  updated_at?: string;
}

// Export types for convenience
export type { User, Session };