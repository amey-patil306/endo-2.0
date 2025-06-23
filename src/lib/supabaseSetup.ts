import { supabase } from './supabase';

// SQL to create symptom_entries table if it doesn't exist
const createSymptomEntriesTable = `
CREATE TABLE IF NOT EXISTS public.symptom_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    date text NOT NULL,
    irregular_periods boolean DEFAULT FALSE,
    cramping boolean DEFAULT FALSE,
    menstrual_clots boolean DEFAULT FALSE,
    infertility boolean DEFAULT FALSE,
    chronic_pain boolean DEFAULT FALSE,
    diarrhea boolean DEFAULT FALSE,
    long_menstruation boolean DEFAULT FALSE,
    vomiting boolean DEFAULT FALSE,
    migraines boolean DEFAULT FALSE,
    extreme_bloating boolean DEFAULT FALSE,
    leg_pain boolean DEFAULT FALSE,
    depression boolean DEFAULT FALSE,
    fertility_issues boolean DEFAULT FALSE,
    ovarian_cysts boolean DEFAULT FALSE,
    painful_urination boolean DEFAULT FALSE,
    pain_after_intercourse boolean DEFAULT FALSE,
    digestive_problems boolean DEFAULT FALSE,
    anemia boolean DEFAULT FALSE,
    hip_pain boolean DEFAULT FALSE,
    vaginal_pain boolean DEFAULT FALSE,
    cysts boolean DEFAULT FALSE,
    abnormal_bleeding boolean DEFAULT FALSE,
    hormonal_problems boolean DEFAULT FALSE,
    feeling_sick boolean DEFAULT FALSE,
    abdominal_cramps_intercourse boolean DEFAULT FALSE,
    insomnia boolean DEFAULT FALSE,
    loss_of_appetite boolean DEFAULT FALSE,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
`;

// SQL to create user_progress table if it doesn't exist
const createUserProgressTable = `
CREATE TABLE IF NOT EXISTS public.user_progress (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL UNIQUE,
    completed_days integer DEFAULT 0 NOT NULL,
    total_days integer DEFAULT 20 NOT NULL,
    start_date text NOT NULL,
    completed_dates text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
`;

// SQL to create unique indexes
const createIndexes = `
CREATE UNIQUE INDEX IF NOT EXISTS symptom_entries_user_id_date_idx ON public.symptom_entries (user_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS user_progress_user_id_idx ON public.user_progress (user_id);
`;

// SQL to enable RLS
const enableRLS = `
ALTER TABLE public.symptom_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
`;

// SQL to create RLS policies for symptom_entries
const createSymptomEntriesPolicies = `
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can insert their own symptom entries" ON public.symptom_entries;
    DROP POLICY IF EXISTS "Users can select their own symptom entries" ON public.symptom_entries;
    DROP POLICY IF EXISTS "Users can update their own symptom entries" ON public.symptom_entries;
    DROP POLICY IF EXISTS "Users can delete their own symptom entries" ON public.symptom_entries;
    
    -- Create new policies
    CREATE POLICY "Users can insert their own symptom entries" ON public.symptom_entries
      FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');
    
    CREATE POLICY "Users can select their own symptom entries" ON public.symptom_entries
      FOR SELECT USING (user_id = auth.jwt() ->> 'sub');
    
    CREATE POLICY "Users can update their own symptom entries" ON public.symptom_entries
      FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');
    
    CREATE POLICY "Users can delete their own symptom entries" ON public.symptom_entries
      FOR DELETE USING (user_id = auth.jwt() ->> 'sub');
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error creating symptom_entries policies: %', SQLERRM;
END $$;
`;

// SQL to create RLS policies for user_progress
const createUserProgressPolicies = `
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can insert their own user progress" ON public.user_progress;
    DROP POLICY IF EXISTS "Users can select their own user progress" ON public.user_progress;
    DROP POLICY IF EXISTS "Users can update their own user progress" ON public.user_progress;
    DROP POLICY IF EXISTS "Users can delete their own user progress" ON public.user_progress;
    
    -- Create new policies
    CREATE POLICY "Users can insert their own user progress" ON public.user_progress
      FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');
    
    CREATE POLICY "Users can select their own user progress" ON public.user_progress
      FOR SELECT USING (user_id = auth.jwt() ->> 'sub');
    
    CREATE POLICY "Users can update their own user progress" ON public.user_progress
      FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');
    
    CREATE POLICY "Users can delete their own user progress" ON public.user_progress
      FOR DELETE USING (user_id = auth.jwt() ->> 'sub');
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error creating user_progress policies: %', SQLERRM;
END $$;
`;

// Function to check if a table exists
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('count')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

// Function to execute SQL with error handling
const executeSQLWithRetry = async (sql: string, description: string, maxRetries = 3): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (!error) {
        console.log(`✅ ${description} - Success`);
        return true;
      }
      
      console.warn(`⚠️ ${description} - Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.error(`❌ ${description} - All attempts failed:`, error);
        return false;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    } catch (error) {
      console.error(`❌ ${description} - Exception on attempt ${attempt}:`, error);
      if (attempt === maxRetries) return false;
    }
  }
  return false;
};

// Alternative method using direct table creation (fallback)
const createTablesDirectly = async (): Promise<boolean> => {
  try {
    console.log('🔧 Attempting direct table creation...');
    
    // Create symptom_entries table
    const { error: symptomError } = await supabase
      .from('symptom_entries')
      .select('count')
      .limit(1);
    
    if (symptomError && symptomError.code === '42P01') {
      console.log('📝 Creating symptom_entries table directly...');
      // Table doesn't exist, but we can't create it directly via the client
      // This would need to be done via the Supabase dashboard or SQL editor
      console.warn('⚠️ symptom_entries table does not exist. Please run the migration manually.');
    }
    
    // Create user_progress table
    const { error: progressError } = await supabase
      .from('user_progress')
      .select('count')
      .limit(1);
    
    if (progressError && progressError.code === '42P01') {
      console.log('📝 Creating user_progress table directly...');
      console.warn('⚠️ user_progress table does not exist. Please run the migration manually.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Direct table creation failed:', error);
    return false;
  }
};

// Main function to ensure all tables exist
export const ensureTablesExist = async (): Promise<{
  success: boolean;
  symptomEntriesExists: boolean;
  userProgressExists: boolean;
  errors: string[];
}> => {
  console.log('🚀 Starting Supabase table verification...');
  
  const errors: string[] = [];
  let symptomEntriesExists = false;
  let userProgressExists = false;
  
  try {
    // Check if tables exist
    console.log('🔍 Checking if tables exist...');
    
    symptomEntriesExists = await checkTableExists('symptom_entries');
    userProgressExists = await checkTableExists('user_progress');
    
    console.log(`📊 Table status:
    - symptom_entries: ${symptomEntriesExists ? '✅ EXISTS' : '❌ MISSING'}
    - user_progress: ${userProgressExists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    // If tables don't exist, try to create them
    if (!symptomEntriesExists || !userProgressExists) {
      console.log('🔧 Some tables are missing. Attempting to create...');
      
      // Try using RPC function first (if available)
      if (!symptomEntriesExists) {
        const created = await executeSQLWithRetry(
          createSymptomEntriesTable,
          'Creating symptom_entries table'
        );
        if (created) {
          symptomEntriesExists = true;
        } else {
          errors.push('Failed to create symptom_entries table');
        }
      }
      
      if (!userProgressExists) {
        const created = await executeSQLWithRetry(
          createUserProgressTable,
          'Creating user_progress table'
        );
        if (created) {
          userProgressExists = true;
        } else {
          errors.push('Failed to create user_progress table');
        }
      }
      
      // Create indexes
      if (symptomEntriesExists || userProgressExists) {
        await executeSQLWithRetry(createIndexes, 'Creating indexes');
        await executeSQLWithRetry(enableRLS, 'Enabling RLS');
        await executeSQLWithRetry(createSymptomEntriesPolicies, 'Creating symptom_entries policies');
        await executeSQLWithRetry(createUserProgressPolicies, 'Creating user_progress policies');
      }
    }
    
    // Final verification
    if (!symptomEntriesExists) {
      symptomEntriesExists = await checkTableExists('symptom_entries');
    }
    if (!userProgressExists) {
      userProgressExists = await checkTableExists('user_progress');
    }
    
    const allTablesExist = symptomEntriesExists && userProgressExists;
    
    if (allTablesExist) {
      console.log('✅ All tables verified successfully!');
    } else {
      console.warn('⚠️ Some tables are still missing. Manual intervention may be required.');
      if (!symptomEntriesExists) errors.push('symptom_entries table is missing');
      if (!userProgressExists) errors.push('user_progress table is missing');
    }
    
    return {
      success: allTablesExist,
      symptomEntriesExists,
      userProgressExists,
      errors
    };
    
  } catch (error) {
    console.error('❌ Error during table verification:', error);
    errors.push(`Table verification failed: ${error}`);
    
    return {
      success: false,
      symptomEntriesExists,
      userProgressExists,
      errors
    };
  }
};

// Function to create RPC function for SQL execution (if needed)
export const createSQLExecutorRPC = async (): Promise<boolean> => {
  try {
    const createRPCFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_query;
    END;
    $$;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: createRPCFunction });
    
    if (error) {
      console.warn('⚠️ Could not create SQL executor RPC function:', error);
      return false;
    }
    
    console.log('✅ SQL executor RPC function created');
    return true;
  } catch (error) {
    console.error('❌ Error creating SQL executor RPC function:', error);
    return false;
  }
};

// Initialize tables on app start
export const initializeSupabaseSchema = async (): Promise<void> => {
  console.log('🎯 Initializing Supabase schema...');
  
  const result = await ensureTablesExist();
  
  if (!result.success) {
    console.error('❌ Schema initialization failed:', result.errors);
    
    // Show user-friendly error message
    const missingTables = [];
    if (!result.symptomEntriesExists) missingTables.push('symptom_entries');
    if (!result.userProgressExists) missingTables.push('user_progress');
    
    if (missingTables.length > 0) {
      console.error(`
🚨 MISSING TABLES: ${missingTables.join(', ')}

To fix this issue:
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the migration files in supabase/migrations/
4. Or copy and paste the table creation SQL from the migration files

The app may not work properly until these tables are created.
      `);
    }
  } else {
    console.log('🎉 Supabase schema initialized successfully!');
  }
};