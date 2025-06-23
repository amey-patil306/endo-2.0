/*
  # Enable realtime for tables

  1. Realtime Configuration
    - Enable realtime for `symptom_entries` table
    - Enable realtime for `user_progress` table
  
  This allows the application to receive real-time updates when data changes.
*/

ALTER PUBLICATION supabase_realtime ADD TABLE public.symptom_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_progress;