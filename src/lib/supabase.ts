import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

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