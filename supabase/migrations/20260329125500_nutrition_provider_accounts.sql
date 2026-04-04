create table if not exists public.nutrition_provider_accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null,
  external_account_id text,
  access_token text not null,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, provider)
);

create index if not exists nutrition_provider_accounts_provider_idx
  on public.nutrition_provider_accounts (provider, status, updated_at desc);

alter table public.nutrition_provider_accounts enable row level security;
