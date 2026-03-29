alter table if exists public.client_nutrition_logs
  add column if not exists metadata jsonb not null default '{}'::jsonb;
