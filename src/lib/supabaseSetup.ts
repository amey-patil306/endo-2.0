import { supabase } from './supabase';

// Function to test Supabase connection
const testSupabaseConnection = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('symptom_entries')
      .select('count')
      .limit(1);
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function to check if a table exists
const checkTableExists = async (tableName: string): Promise<boolean> => {
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

// Main function to ensure all tables exist
const ensureTablesExist = async (): Promise<{
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
    
    const allTablesExist = symptomEntriesExists && userProgressExists;
    
    if (allTablesExist) {
      console.log('✅ All tables verified successfully!');
    } else {
      console.warn('⚠️ Some tables are missing.');
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

// Initialize tables on app start
const initializeSupabaseSchema = async (): Promise<void> => {
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

The tables appear to be missing from your Supabase database.
Please check your Supabase dashboard and ensure the migrations have been run.
      `);
    }
  } else {
    console.log('🎉 Supabase schema initialized successfully!');
  }
};

// Export all functions
export {
  testSupabaseConnection,
  checkTableExists,
  ensureTablesExist,
  initializeSupabaseSchema
};