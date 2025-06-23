/*
  # Create symptom entries table

  1. New Tables
    - `symptom_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (text, for date string)
      - Multiple boolean columns for different symptoms
      - `notes` (text, optional)
      - `created_at` and `updated_at` (timestamps)
  
  2. Security
    - Enable RLS on `symptom_entries` table
    - Add policies for authenticated users to manage their own data
    - Create unique index on user_id and date combination
*/

CREATE TABLE IF NOT EXISTS public.symptom_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
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

ALTER TABLE public.symptom_entries ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS symptom_entries_user_id_date_idx ON public.symptom_entries (user_id, date);

CREATE POLICY "Users can insert their own symptom entries" ON public.symptom_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own symptom entries" ON public.symptom_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptom entries" ON public.symptom_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptom entries" ON public.symptom_entries
  FOR DELETE USING (auth.uid() = user_id);