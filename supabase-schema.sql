-- Run this in Supabase SQL editor.
-- It creates a profile table with role values used by the login guard.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('coach', 'client')),
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Each user can read their own profile.
create policy if not exists "read own profile"
on public.profiles
for select
using (auth.uid() = id);

-- Service role can insert/update profiles from backend/admin scripts.
-- (No client-side insert policy intentionally.)
