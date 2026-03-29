alter table public.sessions
  add column if not exists coach_note text,
  add column if not exists coach_next_step text,
  add column if not exists coach_note_recorded_at timestamptz,
  add column if not exists coach_note_recorded_by uuid references public.profiles(id);

create index if not exists sessions_coach_note_recorded_idx
  on public.sessions (coach_id, coach_note_recorded_at desc nulls last);
