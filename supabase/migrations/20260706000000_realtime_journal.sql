-- Let admins receive live notifications (new orders, stock alertes) via Supabase Realtime.
-- RLS on public.journal ("admins can read journal") already scopes this to admin accounts only.
alter publication supabase_realtime add table public.journal;
