create or replace function public.list_active_coaches()
returns table (
  id uuid,
  display_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    coalesce(nullif(btrim(p.display_name), ''), 'Coach') as display_name
  from public.profiles p
  where p.role = 'coach'
    and p.status = 'active'
  order by lower(coalesce(p.display_name, '')), p.id
$$;

revoke all on function public.list_active_coaches() from public;
grant execute on function public.list_active_coaches() to anon, authenticated, service_role;

create or replace function public.list_public_coach_windows(
  p_coach_id uuid default null,
  p_coach_name text default null
)
returns table (
  coach_id uuid,
  display_name text,
  day_of_week integer,
  start_time time,
  end_time time,
  timezone text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with active_coaches as (
    select
      p.id,
      coalesce(nullif(btrim(p.display_name), ''), 'Coach') as display_name
    from public.profiles p
    where p.role = 'coach'
      and p.status = 'active'
      and (p_coach_id is null or p.id = p_coach_id)
      and (
        nullif(btrim(p_coach_name), '') is null
        or lower(coalesce(p.display_name, '')) = lower(btrim(p_coach_name))
      )
  )
  select
    w.coach_id,
    c.display_name,
    w.day_of_week,
    w.start_time,
    w.end_time,
    w.timezone,
    w.updated_at
  from public.coach_availability_windows w
  join active_coaches c
    on c.id = w.coach_id
  where w.is_active = true
  order by lower(c.display_name), w.day_of_week, w.start_time
$$;

revoke all on function public.list_public_coach_windows(uuid, text) from public;
grant execute on function public.list_public_coach_windows(uuid, text) to anon, authenticated, service_role;

create or replace function public.list_public_scheduled_sessions(
  p_coach_id uuid default null,
  p_coach_name text default null,
  p_range_start timestamptz default timezone('utc', now()),
  p_range_end timestamptz default (timezone('utc', now()) + interval '8 days')
)
returns table (
  coach_id uuid,
  session_id uuid,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  with active_coaches as (
    select
      p.id
    from public.profiles p
    where p.role = 'coach'
      and p.status = 'active'
      and (p_coach_id is null or p.id = p_coach_id)
      and (
        nullif(btrim(p_coach_name), '') is null
        or lower(coalesce(p.display_name, '')) = lower(btrim(p_coach_name))
      )
  )
  select
    s.coach_id,
    s.id as session_id,
    s.scheduled_start,
    s.scheduled_end,
    s.status
  from public.sessions s
  join active_coaches c
    on c.id = s.coach_id
  where s.status = 'scheduled'
    and s.scheduled_start < p_range_end
    and s.scheduled_end > p_range_start
  order by s.coach_id, s.scheduled_start
$$;

revoke all on function public.list_public_scheduled_sessions(uuid, text, timestamptz, timestamptz) from public;
grant execute on function public.list_public_scheduled_sessions(uuid, text, timestamptz, timestamptz) to anon, authenticated, service_role;
