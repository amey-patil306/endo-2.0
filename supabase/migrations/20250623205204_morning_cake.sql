/*
  # Fix user_id column type from uuid to text

  1. Database Changes
    - Change user_id columns from uuid to text in both tables
    - Update foreign key constraints to reference auth.users(id)
    - Recreate indexes and policies

  2. Security
    - Temporarily drop and recreate RLS policies
    - Maintain same security model with text user IDs
*/

-- Step 1: Drop all RLS policies that depend on user_id columns
DROP POLICY IF EXISTS "Users can delete their own symptom entries" ON symptom_entries;
DROP POLICY IF EXISTS "Users can insert their own symptom entries" ON symptom_entries;
DROP POLICY IF EXISTS "Users can select their own symptom entries" ON symptom_entries;
DROP POLICY IF EXISTS "Users can update their own symptom entries" ON symptom_entries;

DROP POLICY IF EXISTS "Users can delete their own user progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert their own user progress" ON user_progress;
DROP POLICY IF EXISTS "Users can select their own user progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update their own user progress" ON user_progress;

-- Step 2: Drop foreign key constraints
ALTER TABLE IF EXISTS symptom_entries DROP CONSTRAINT IF EXISTS symptom_entries_user_id_fkey;
ALTER TABLE IF EXISTS user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;

-- Step 3: Drop indexes that include user_id
DROP INDEX IF EXISTS symptom_entries_user_id_date_idx;

-- Step 4: Change user_id column types from uuid to text
ALTER TABLE symptom_entries ALTER COLUMN user_id TYPE text;
ALTER TABLE user_progress ALTER COLUMN user_id TYPE text;

-- Step 5: Recreate indexes
CREATE UNIQUE INDEX symptom_entries_user_id_date_idx 
ON symptom_entries USING btree (user_id, date);

-- Step 6: Add foreign key constraints back (referencing auth.users which uses text id)
ALTER TABLE symptom_entries 
ADD CONSTRAINT symptom_entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_progress 
ADD CONSTRAINT user_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 7: Recreate RLS policies for symptom_entries
CREATE POLICY "Users can delete their own symptom entries"
  ON symptom_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own symptom entries"
  ON symptom_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can select their own symptom entries"
  ON symptom_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own symptom entries"
  ON symptom_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Step 8: Recreate RLS policies for user_progress
CREATE POLICY "Users can delete their own user progress"
  ON user_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own user progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can select their own user progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own user progress"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id);