alter table public.progress_photo_entries
  add column if not exists ai_body_fat_estimate numeric(5, 2),
  add column if not exists ai_body_fat_range_low numeric(5, 2),
  add column if not exists ai_body_fat_range_high numeric(5, 2),
  add column if not exists ai_body_fat_confidence numeric(4, 3),
  add column if not exists ai_body_fat_summary text,
  add column if not exists ai_body_fat_visible_cues text[] not null default '{}'::text[],
  add column if not exists ai_body_fat_caveats text[] not null default '{}'::text[],
  add column if not exists ai_body_fat_provider text,
  add column if not exists ai_body_fat_status text not null default 'unavailable',
  add column if not exists ai_body_fat_completed_at timestamptz,
  add column if not exists ai_body_fat_error text,
  add column if not exists ai_body_fat_raw jsonb not null default '{}'::jsonb;

alter table public.progress_photo_entries
  drop constraint if exists progress_photo_entries_ai_body_fat_status_check;

alter table public.progress_photo_entries
  add constraint progress_photo_entries_ai_body_fat_status_check
  check (ai_body_fat_status in ('pending', 'completed', 'failed', 'unavailable'));

create index if not exists progress_photo_entries_ai_body_fat_status_idx
  on public.progress_photo_entries (ai_body_fat_status, captured_at desc);
