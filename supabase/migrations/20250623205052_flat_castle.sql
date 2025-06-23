/*
  # Fix user_id column type mismatch

  1. Changes
    - Change `user_id` column type from `uuid` to `text` in `symptom_entries` table
    - Change `user_id` column type from `uuid` to `text` in `user_progress` table
    - Update foreign key constraints to work with text type
    - Recreate indexes with new column type

  2. Security
    - Maintain existing RLS policies (they will work with text user_id)
    - Keep all existing constraints and relationships

  This fixes the "invalid input syntax for type uuid" error when using Firebase Auth user IDs.
*/

-- First, drop the foreign key constraints
ALTER TABLE IF EXISTS symptom_entries DROP CONSTRAINT IF EXISTS symptom_entries_user_id_fkey;
ALTER TABLE IF EXISTS user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;

-- Drop the unique index on symptom_entries that includes user_id
DROP INDEX IF EXISTS symptom_entries_user_id_date_idx;

-- Change user_id column type in symptom_entries table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'symptom_entries' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE symptom_entries ALTER COLUMN user_id TYPE text;
  END IF;
END $$;

-- Change user_id column type in user_progress table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE user_progress ALTER COLUMN user_id TYPE text;
  END IF;
END $$;

-- Recreate the unique index on symptom_entries
CREATE UNIQUE INDEX IF NOT EXISTS symptom_entries_user_id_date_idx 
ON symptom_entries USING btree (user_id, date);

-- Add foreign key constraint back (referencing auth.users which uses text uid)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'symptom_entries_user_id_fkey'
  ) THEN
    ALTER TABLE symptom_entries 
    ADD CONSTRAINT symptom_entries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_progress_user_id_fkey'
  ) THEN
    ALTER TABLE user_progress 
    ADD CONSTRAINT user_progress_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;