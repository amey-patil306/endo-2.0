import { supabase } from './supabase';

// Function to test Supabase connection with detailed error reporting
export const testSupabaseConnection = async (): Promise<{
  connected: boolean;
  tablesExist: boolean;
  errors: string[];
}> => {
  console.log('🔍 Testing Supabase connection...');
  
  const errors: string[] = [];
  let connected = false;
  let tablesExist = false;

  // Check environment variables first
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || supabaseUrl.includes('your-project') || supabaseUrl.includes('placeholder')) {
    errors.push('VITE_SUPABASE_URL is not properly configured in .env file');
    return { connected: false, tablesExist: false, errors };
  }

  if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon-key') || supabaseAnonKey.includes('placeholder')) {
    errors.push('VITE_SUPABASE_ANON_KEY is not properly configured in .env file');
    return { connected: false, tablesExist: false, errors };
  }

  try {
    // Test basic connection
    console.log('🌐 Testing basic connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('symptom_entries')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Connection test failed:', healthError);
      
      if (healthError.message.includes('relation') && healthError.message.includes('does not exist')) {
        errors.push('Tables do not exist in database. Please run migrations.');
        connected = true; // Connection works, but tables missing
      } else if (healthError.message.includes('JWT')) {
        errors.push('Authentication error. Check your Supabase anon key.');
      } else if (healthError.message.includes('Invalid API key')) {
        errors.push('Invalid Supabase API key. Check your configuration.');
      } else {
        errors.push(`Connection failed: ${healthError.message}`);
      }
    } else {
      console.log('✅ Basic connection successful');
      connected = true;
    }

    // Test table existence if connected
    if (connected) {
      console.log('📊 Testing table existence...');
      const tableTests = await Promise.allSettled([
        checkTableExists('symptom_entries'),
        checkTableExists('user_progress')
      ]);

      const symptomEntriesExists = tableTests[0].status === 'fulfilled' && tableTests[0].value;
      const userProgressExists = tableTests[1].status === 'fulfilled' && tableTests[1].value;

      tablesExist = symptomEntriesExists && userProgressExists;

      if (!symptomEntriesExists) {
        errors.push('symptom_entries table does not exist');
      }
      if (!userProgressExists) {
        errors.push('user_progress table does not exist');
      }

      if (tablesExist) {
        console.log('✅ All tables exist and accessible');
      } else {
        console.warn('⚠️ Some tables are missing or inaccessible');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error during connection test:', error);
    errors.push(`Unexpected error: ${error}`);
  }

  const result = { connected, tablesExist, errors };
  console.log('🏁 Connection test complete:', result);
  
  return result;
};

// Function to check if a table exists
const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('count')
      .limit(1);
    
    if (error) {
      console.error(`❌ Table ${tableName} check failed:`, error.message);
      return false;
    }
    
    console.log(`✅ Table ${tableName} exists and accessible`);
    return true;
  } catch (error) {
    console.error(`❌ Error checking table ${tableName}:`, error);
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
  console.log('🚀 Starting table verification...');
  
  const errors: string[] = [];
  let symptomEntriesExists = false;
  let userProgressExists = false;
  
  try {
    // Check environment variables first
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || supabaseUrl.includes('your-project') || supabaseUrl.includes('placeholder')) {
      errors.push('Supabase URL not configured. Please check your .env file.');
      return { success: false, symptomEntriesExists, userProgressExists, errors };
    }

    if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon-key') || supabaseAnonKey.includes('placeholder')) {
      errors.push('Supabase anon key not configured. Please check your .env file.');
      return { success: false, symptomEntriesExists, userProgressExists, errors };
    }

    // Check if tables exist
    console.log('🔍 Checking table existence...');
    
    symptomEntriesExists = await checkTableExists('symptom_entries');
    userProgressExists = await checkTableExists('user_progress');
    
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

// Initialize Supabase schema
export const initializeSupabaseSchema = async (): Promise<void> => {
  console.log('🎯 Initializing Supabase schema...');
  
  // First check if environment is properly configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || supabaseUrl.includes('your-project') || supabaseUrl.includes('placeholder')) {
    console.error(`
❌ SUPABASE URL NOT CONFIGURED

Please update your .env file with your actual Supabase URL:
VITE_SUPABASE_URL=https://your-project-ref.supabase.co

You can find this in your Supabase Dashboard > Settings > API
    `);
    return;
  }

  if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon-key') || supabaseAnonKey.includes('placeholder')) {
    console.error(`
❌ SUPABASE ANON KEY NOT CONFIGURED

Please update your .env file with your actual Supabase anon key:
VITE_SUPABASE_ANON_KEY=your-actual-anon-key

You can find this in your Supabase Dashboard > Settings > API
    `);
    return;
  }

  const result = await ensureTablesExist();
  
  if (!result.success) {
    console.error('❌ Schema initialization failed:', result.errors);
    
    if (result.errors.some(error => error.includes('missing'))) {
      console.error(`
🚨 MISSING TABLES DETECTED

Please run the following SQL in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the migration files in order:
   - supabase/migrations/20250623202408_mute_block.sql
   - supabase/migrations/20250623202420_green_tree.sql  
   - supabase/migrations/20250623202427_silver_shape.sql

Or copy the SQL from these files and run them manually.
      `);
    }
  } else {
    console.log('🎉 Supabase schema initialized successfully!');
  }
};