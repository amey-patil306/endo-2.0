/*
  # Create user progress table

  1. New Tables
    - `user_progress`
      - `user_id` (uuid, primary key, foreign key to auth.users)
      - `completed_days` (integer, default 0)
      - `total_days` (integer, default 20)
      - `start_date` (text, for date string)
      - `completed_dates` (text array, list of completed dates)
      - `created_at` and `updated_at` (timestamps)
  
  2. Security
    - Enable RLS on `user_progress` table
    - Add policies for authenticated users to manage their own progress data
*/

CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    completed_days integer DEFAULT 0 NOT NULL,
    total_days integer DEFAULT 20 NOT NULL,
    start_date text NOT NULL,
    completed_dates text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own user progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own user progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own user progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user progress" ON public.user_progress
  FOR DELETE USING (auth.uid() = user_id);