-- LEGACY+ Coach XP module
-- Additive only. All objects live in xp_coach.

create schema if not exists xp_coach;

create or replace function xp_coach.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
  );
$$;

create or replace function xp_coach.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists xp_coach.coaches (
  id uuid primary key default gen_random_uuid(),
  coach_id text not null unique,
  coach_name text not null,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  profile_id uuid null references public.profiles(id),
  identity_path text not null default 'Neutral' check (identity_path in ('Greek', 'Aesir', 'Neutral')),
  operational_role text null check (operational_role in ('T1','T2','T3','T4','T5','T6','T7','T8','T9')),
  role_locked_to text null check (role_locked_to in ('T1','T2','T3','T4','T5','T6','T7','T8','T9')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists xp_coach.actions (
  action_id text primary key,
  action_name text not null,
  bucket text not null,
  xp_per integer not null check (xp_per >= 0),
  cap_period text not null default 'None' check (cap_period in ('None','Weekly','Monthly','Quarterly','Yearly','OneTime')),
  cap_max_xp integer null,
  cooldown_days integer not null default 0,
  verification text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists xp_coach.settings (
  key text primary key,
  value text not null
);

create table if not exists xp_coach.role_titles (
  role_id text primary key check (role_id in ('T1','T2','T3','T4','T5','T6','T7','T8','T9')),
  min_xp integer not null,
  max_xp integer not null,
  operational_title text not null,
  greek_title text not null,
  aesir_title text not null
);

create table if not exists xp_coach.xp_bands (
  tier text primary key check (tier in ('T1','T2','T3','T4','T5','T6','T7','T8','T9')),
  min_xp integer not null,
  max_xp integer not null,
  level_start integer not null,
  level_end integer not null,
  level_count integer not null,
  step_xp numeric not null
);

create table if not exists xp_coach.events (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  coach_id text not null references xp_coach.coaches(coach_id) on delete restrict,
  action_id text not null references xp_coach.actions(action_id) on delete restrict,
  qty numeric not null default 1,
  verified boolean not null default true,
  evidence text null,
  notes text null,
  created_by_profile_id uuid null references public.profiles(id),
  xp_override integer null,
  source_ref text null unique,
  created_at timestamptz not null default now()
);

create table if not exists xp_coach.trials (
  id uuid primary key default gen_random_uuid(),
  coach_id text not null references xp_coach.coaches(coach_id) on delete restrict,
  "current_role" text not null check ("current_role" in ('T1','T2','T3','T4','T5','T6','T7','T8','T9')),
  "target_role" text not null check ("target_role" in ('T1','T2','T3','T4','T5','T6','T7','T8','T9')),
  trial_date date null,
  skill_trial text not null default 'Pending' check (skill_trial in ('Pending','Pass','Fail')),
  knowledge_trial text not null default 'Pending' check (knowledge_trial in ('Pending','Pass','Fail')),
  portfolio text not null default 'Pending' check (portfolio in ('Pending','Pass','Fail')),
  result text generated always as (
    case
      when skill_trial = 'Pass' and knowledge_trial = 'Pass' and portfolio = 'Pass'
        then 'PROMOTE'
      else 'NOT_YET'
    end
  ) stored,
  notes text null,
  created_by_profile_id uuid null references public.profiles(id),
  source_ref text null unique,
  created_at timestamptz not null default now()
);

create table if not exists xp_coach.seeding (
  id uuid primary key default gen_random_uuid(),
  coach_id text not null unique references xp_coach.coaches(coach_id) on delete restrict,
  seed_xp integer not null default 0,
  approved boolean not null default false,
  notes text null,
  created_by_profile_id uuid null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists xp_coach_events_coach_date_idx on xp_coach.events (coach_id, event_date);
create index if not exists xp_coach_events_action_idx on xp_coach.events (action_id);
create index if not exists xp_coach_events_verified_idx on xp_coach.events (verified);
create index if not exists xp_coach_trials_coach_idx on xp_coach.trials (coach_id, trial_date desc nulls last);
create index if not exists xp_coach_coaches_profile_idx on xp_coach.coaches (profile_id);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'xp_coach_coaches_touch_updated_at'
  ) then
    create trigger xp_coach_coaches_touch_updated_at
    before update on xp_coach.coaches
    for each row
    execute function xp_coach.touch_updated_at();
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'xp_coach_actions_touch_updated_at'
  ) then
    create trigger xp_coach_actions_touch_updated_at
    before update on xp_coach.actions
    for each row
    execute function xp_coach.touch_updated_at();
  end if;
end
$$;

create or replace function xp_coach.sync_seed_event()
returns trigger
language plpgsql
set search_path = xp_coach, public
as $$
declare
  seed_source_ref text := 'seed:' || new.id::text;
begin
  if new.approved then
    insert into xp_coach.events (
      event_date,
      coach_id,
      action_id,
      qty,
      verified,
      evidence,
      notes,
      created_by_profile_id,
      xp_override,
      source_ref
    )
    values (
      coalesce(new.created_at::date, current_date),
      new.coach_id,
      'SEED-INIT',
      1,
      true,
      seed_source_ref,
      coalesce(new.notes, 'Approved seed placement'),
      new.created_by_profile_id,
      new.seed_xp,
      seed_source_ref
    )
    on conflict (source_ref) do update
      set verified = true,
          xp_override = excluded.xp_override,
          notes = excluded.notes,
          created_by_profile_id = excluded.created_by_profile_id;
  else
    update xp_coach.events
      set verified = false,
          notes = coalesce(new.notes, notes)
    where source_ref = seed_source_ref;
  end if;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'xp_coach_sync_seed_event_trigger'
  ) then
    create trigger xp_coach_sync_seed_event_trigger
    after insert or update on xp_coach.seeding
    for each row
    execute function xp_coach.sync_seed_event();
  end if;
end
$$;

alter table xp_coach.coaches enable row level security;
alter table xp_coach.actions enable row level security;
alter table xp_coach.events enable row level security;
alter table xp_coach.settings enable row level security;
alter table xp_coach.role_titles enable row level security;
alter table xp_coach.xp_bands enable row level security;
alter table xp_coach.trials enable row level security;
alter table xp_coach.seeding enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'xp_coach' and tablename = 'coaches' and policyname = 'xp_coach_coaches_super_admin_all'
  ) then
    create policy xp_coach_coaches_super_admin_all
      on xp_coach.coaches
      for all
      to authenticated
      using (xp_coach.is_super_admin())
      with check (xp_coach.is_super_admin());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'xp_coach' and tablename = 'actions' and policyname = 'xp_coach_actions_super_admin_all'
  ) then
    create policy xp_coach_actions_super_admin_all
      on xp_coach.actions
      for all
      to authenticated
      using (xp_coach.is_super_admin())
      with check (xp_coach.is_super_admin());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'xp_coach' and tablename = 'events' and policyname = 'xp_coach_events_super_admin_all'
  ) then
    create policy xp_coach_events_super_admin_all
      on xp_coach.events
      for all
      to authenticated
      using (xp_coach.is_super_admin())
      with check (xp_coach.is_super_admin());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'xp_coach' and tablename = 'settings' and policyname = 'xp_coach_settings_super_admin_all'
  ) then
    create policy xp_coach_settings_super_admin_all
      on xp_coach.settings
      for all
      to authenticated
      using (xp_coach.is_super_admin())
      with check (xp_coach.is_super_admin());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'xp_coach' and tablename = 'role_titles' and policyname = 'xp_coach_role_titles_super_admin_all'
  ) then
    create policy xp_coach_role_titles_super_admin_all
      on xp_coach.role_titles
      for all
      to authenticated
      using (xp_coach.is_super_admin())
      with check (xp_coach.is_super_admin());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'xp_coach' and tablename = 'xp_bands' and policyname = 'xp_coach_xp_bands_super_admin_all'
  ) then
    create policy xp_coach_xp_bands_super_admin_all
      on xp_coach.xp_bands
      for all
      to authenticated
      using (xp_coach.is_super_admin())
      with check (xp_coach.is_super_admin());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'xp_coach' and tablename = 'trials' and policyname = 'xp_coach_trials_super_admin_all'
  ) then
    create policy xp_coach_trials_super_admin_all
      on xp_coach.trials
      for all
      to authenticated
      using (xp_coach.is_super_admin())
      with check (xp_coach.is_super_admin());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'xp_coach' and tablename = 'seeding' and policyname = 'xp_coach_seeding_super_admin_all'
  ) then
    create policy xp_coach_seeding_super_admin_all
      on xp_coach.seeding
      for all
      to authenticated
      using (xp_coach.is_super_admin())
      with check (xp_coach.is_super_admin());
  end if;
end
$$;

grant usage on schema xp_coach to authenticated, service_role;
grant select, insert, update, delete on all tables in schema xp_coach to authenticated, service_role;

create or replace view xp_coach.event_scored_view
with (security_invoker = true)
as
select
  e.id,
  e.event_date,
  e.coach_id,
  e.action_id,
  a.action_name,
  a.bucket,
  a.cap_period,
  e.qty,
  e.verified,
  e.evidence,
  e.notes,
  e.created_by_profile_id,
  e.xp_override,
  e.source_ref,
  e.created_at,
  case
    when e.verified then coalesce(e.xp_override, round(a.xp_per::numeric * e.qty))
    else 0
  end::numeric as xp_raw,
  to_char(e.event_date, 'IYYY') || '-W' || to_char(e.event_date, 'IW') as week_key,
  to_char(e.event_date, 'YYYY-MM') as month_key,
  to_char(e.event_date, 'YYYY') || '-Q' || extract(quarter from e.event_date)::int as quarter_key
from xp_coach.events e
join xp_coach.actions a on a.action_id = e.action_id;

create or replace view xp_coach.weekly_bucket_summary_view
with (security_invoker = true)
as
select
  es.coach_id,
  es.week_key,
  sum(case when es.bucket = 'Coaching' then es.xp_raw else 0 end)::numeric as coaching_raw_xp,
  least(
    sum(case when es.bucket = 'Coaching' then es.xp_raw else 0 end)::numeric,
    coalesce((select value::numeric from xp_coach.settings where key = 'CoachingWeeklyCapXP'), 120)
  ) as coaching_counted_xp,
  greatest(
    sum(case when es.bucket = 'Coaching' then es.xp_raw else 0 end)::numeric
      - coalesce((select value::numeric from xp_coach.settings where key = 'CoachingWeeklyCapXP'), 120),
    0
  ) as coaching_overcap_xp
from xp_coach.event_scored_view es
group by es.coach_id, es.week_key;

create or replace view xp_coach.monthly_bucket_summary_view
with (security_invoker = true)
as
select
  es.coach_id,
  es.month_key,
  sum(case when es.bucket = 'Education' then es.xp_raw else 0 end)::numeric as education_raw_xp,
  least(
    sum(case when es.bucket = 'Education' then es.xp_raw else 0 end)::numeric,
    coalesce((select value::numeric from xp_coach.settings where key = 'EducationMonthlyCapXP'), 150)
  ) as education_counted_xp,
  greatest(
    sum(case when es.bucket = 'Education' then es.xp_raw else 0 end)::numeric
      - coalesce((select value::numeric from xp_coach.settings where key = 'EducationMonthlyCapXP'), 150),
    0
  ) as education_overcap_xp,
  sum(case when es.bucket = 'Ops' then es.xp_raw else 0 end)::numeric as ops_raw_xp,
  sum(case when es.bucket = 'Professional' then es.xp_raw else 0 end)::numeric as professional_raw_xp,
  sum(case when es.bucket = 'Systems' then es.xp_raw else 0 end)::numeric as systems_raw_xp,
  sum(case when es.bucket = 'Programming' then es.xp_raw else 0 end)::numeric as programming_raw_xp,
  sum(case when es.bucket = 'Experience' then es.xp_raw else 0 end)::numeric as experience_raw_xp,
  sum(case when es.bucket in ('Ops', 'Professional', 'Systems', 'Programming', 'Experience') then es.xp_raw else 0 end)::numeric as ops_group_raw_xp,
  least(
    sum(case when es.bucket in ('Ops', 'Professional', 'Systems', 'Programming', 'Experience') then es.xp_raw else 0 end)::numeric,
    coalesce((select value::numeric from xp_coach.settings where key = 'OpsMonthlyCapXP'), 120)
  ) as ops_group_counted_xp,
  greatest(
    sum(case when es.bucket in ('Ops', 'Professional', 'Systems', 'Programming', 'Experience') then es.xp_raw else 0 end)::numeric
      - coalesce((select value::numeric from xp_coach.settings where key = 'OpsMonthlyCapXP'), 120),
    0
  ) as ops_group_overcap_xp,
  sum(case when es.bucket = 'Mentorship' then es.xp_raw else 0 end)::numeric as mentorship_raw_xp,
  sum(case when es.bucket = 'Reputation' then es.xp_raw else 0 end)::numeric as reputation_raw_xp,
  sum(case when es.bucket in ('Mentorship', 'Reputation') then es.xp_raw else 0 end)::numeric as mentorship_group_raw_xp,
  least(
    sum(case when es.bucket in ('Mentorship', 'Reputation') then es.xp_raw else 0 end)::numeric,
    coalesce((select value::numeric from xp_coach.settings where key = 'MentorshipMonthlyCapXP'), 150)
  ) as mentorship_group_counted_xp,
  greatest(
    sum(case when es.bucket in ('Mentorship', 'Reputation') then es.xp_raw else 0 end)::numeric
      - coalesce((select value::numeric from xp_coach.settings where key = 'MentorshipMonthlyCapXP'), 150),
    0
  ) as mentorship_group_overcap_xp
from xp_coach.event_scored_view es
group by es.coach_id, es.month_key;

create or replace view xp_coach.quarterly_bucket_summary_view
with (security_invoker = true)
as
select
  es.coach_id,
  es.quarter_key,
  sum(case when es.bucket = 'Impact' then es.xp_raw else 0 end)::numeric as impact_raw_xp,
  sum(case when es.bucket = 'Competition' then es.xp_raw else 0 end)::numeric as competition_raw_xp,
  sum(case when es.bucket in ('Impact', 'Competition') then es.xp_raw else 0 end)::numeric as impact_competition_raw_xp,
  least(
    sum(case when es.bucket in ('Impact', 'Competition') then es.xp_raw else 0 end)::numeric,
    coalesce((select value::numeric from xp_coach.settings where key = 'ImpactQuarterlyCapXP'), 300)
  ) as impact_competition_counted_xp,
  greatest(
    sum(case when es.bucket in ('Impact', 'Competition') then es.xp_raw else 0 end)::numeric
      - coalesce((select value::numeric from xp_coach.settings where key = 'ImpactQuarterlyCapXP'), 300),
    0
  ) as impact_competition_overcap_xp
from xp_coach.event_scored_view es
group by es.coach_id, es.quarter_key;

create or replace view xp_coach.latest_trials_view
with (security_invoker = true)
as
select distinct on (t.coach_id)
  t.id,
  t.coach_id,
  t."current_role" as current_role,
  t."target_role" as target_role,
  t.trial_date,
  t.skill_trial,
  t.knowledge_trial,
  t.portfolio,
  t.result,
  t.notes,
  t.created_by_profile_id,
  t.created_at
from xp_coach.trials t
order by t.coach_id, t.trial_date desc nulls last, t.created_at desc;

create or replace view xp_coach.ledger_view
with (security_invoker = true)
as
with coaching_totals as (
  select coach_id, coalesce(sum(coaching_counted_xp), 0)::numeric as coaching_weekly_counted_xp
  from xp_coach.weekly_bucket_summary_view
  group by coach_id
),
monthly_totals as (
  select
    coach_id,
    coalesce(sum(education_counted_xp), 0)::numeric as education_monthly_counted_xp,
    coalesce(sum(ops_group_counted_xp), 0)::numeric as ops_monthly_counted_xp,
    coalesce(sum(mentorship_group_counted_xp), 0)::numeric as mentorship_monthly_counted_xp
  from xp_coach.monthly_bucket_summary_view
  group by coach_id
),
quarterly_totals as (
  select
    coach_id,
    coalesce(sum(impact_competition_counted_xp), 0)::numeric as impact_quarterly_counted_xp
  from xp_coach.quarterly_bucket_summary_view
  group by coach_id
),
uncapped_totals as (
  select
    coach_id,
    coalesce(sum(case when bucket = 'Admin' then xp_raw else 0 end), 0)::numeric as uncapped_admin_xp,
    coalesce(sum(case when bucket = 'Seeding' then xp_raw else 0 end), 0)::numeric as uncapped_seeding_xp
  from xp_coach.event_scored_view
  group by coach_id
),
totals as (
  select
    c.coach_id,
    c.coach_name,
    c.status,
    c.profile_id,
    c.identity_path,
    c.operational_role,
    c.role_locked_to,
    coalesce(ct.coaching_weekly_counted_xp, 0) as coaching_weekly_counted_xp,
    coalesce(mt.education_monthly_counted_xp, 0) as education_monthly_counted_xp,
    coalesce(mt.ops_monthly_counted_xp, 0) as ops_monthly_counted_xp,
    coalesce(mt.mentorship_monthly_counted_xp, 0) as mentorship_monthly_counted_xp,
    coalesce(qt.impact_quarterly_counted_xp, 0) as impact_quarterly_counted_xp,
    coalesce(ut.uncapped_admin_xp, 0) as uncapped_admin_xp,
    coalesce(ut.uncapped_seeding_xp, 0) as uncapped_seeding_xp
  from xp_coach.coaches c
  left join coaching_totals ct on ct.coach_id = c.coach_id
  left join monthly_totals mt on mt.coach_id = c.coach_id
  left join quarterly_totals qt on qt.coach_id = c.coach_id
  left join uncapped_totals ut on ut.coach_id = c.coach_id
),
totals_with_sum as (
  select
    t.*,
    (
      t.coaching_weekly_counted_xp
      + t.education_monthly_counted_xp
      + t.ops_monthly_counted_xp
      + t.mentorship_monthly_counted_xp
      + t.impact_quarterly_counted_xp
      + t.uncapped_admin_xp
      + t.uncapped_seeding_xp
    )::numeric as total_xp_counted
  from totals t
),
derived_roles as (
  select
    tws.*,
    rt.role_id as derived_role_id,
    rt.operational_title as derived_operational_title,
    rt.greek_title as derived_greek_title,
    rt.aesir_title as derived_aesir_title,
    rt.min_xp as derived_role_min_xp,
    rt.max_xp as derived_role_max_xp
  from totals_with_sum tws
  left join lateral (
    select *
    from xp_coach.role_titles rt
    where rt.min_xp <= tws.total_xp_counted
    order by rt.min_xp desc
    limit 1
  ) rt on true
)
select
  dr.coach_id,
  dr.coach_name,
  dr.status,
  dr.profile_id,
  dr.identity_path,
  dr.operational_role,
  dr.role_locked_to,
  dr.coaching_weekly_counted_xp,
  dr.education_monthly_counted_xp,
  dr.ops_monthly_counted_xp,
  dr.mentorship_monthly_counted_xp,
  dr.impact_quarterly_counted_xp,
  dr.uncapped_admin_xp,
  dr.uncapped_seeding_xp,
  dr.total_xp_counted,
  dr.derived_role_id,
  coalesce(locked.role_id, dr.derived_role_id) as current_role_id,
  coalesce(locked.operational_title, dr.derived_operational_title) as current_operational_title,
  coalesce(locked.greek_title, dr.derived_greek_title) as current_greek_title,
  coalesce(locked.aesir_title, dr.derived_aesir_title) as current_aesir_title,
  least(
    100,
    floor(
      (dr.total_xp_counted / greatest(coalesce((select max(max_xp) from xp_coach.role_titles), 20000), 1)) * 100
    )::integer
  ) as global_level
from derived_roles dr
left join xp_coach.role_titles locked on locked.role_id = dr.role_locked_to;

create or replace view xp_coach.coach_overview_view
with (security_invoker = true)
as
select
  c.id,
  c.coach_id,
  c.coach_name,
  c.status,
  c.profile_id,
  c.identity_path,
  c.operational_role,
  c.role_locked_to,
  p.display_name as profile_display_name,
  p.avatar_url as profile_avatar_url,
  l.total_xp_counted,
  l.current_role_id,
  l.current_operational_title,
  l.current_greek_title,
  l.current_aesir_title,
  l.global_level,
  l.coaching_weekly_counted_xp,
  l.education_monthly_counted_xp,
  l.ops_monthly_counted_xp,
  l.mentorship_monthly_counted_xp,
  l.impact_quarterly_counted_xp,
  l.uncapped_admin_xp,
  l.uncapped_seeding_xp,
  lt.target_role as latest_target_role,
  lt.result as latest_trial_result,
  lt.trial_date as latest_trial_date
from xp_coach.coaches c
left join public.profiles p on p.id = c.profile_id
left join xp_coach.ledger_view l on l.coach_id = c.coach_id
left join xp_coach.latest_trials_view lt on lt.coach_id = c.coach_id;

grant select on xp_coach.event_scored_view to authenticated, service_role;
grant select on xp_coach.weekly_bucket_summary_view to authenticated, service_role;
grant select on xp_coach.monthly_bucket_summary_view to authenticated, service_role;
grant select on xp_coach.quarterly_bucket_summary_view to authenticated, service_role;
grant select on xp_coach.latest_trials_view to authenticated, service_role;
grant select on xp_coach.ledger_view to authenticated, service_role;
grant select on xp_coach.coach_overview_view to authenticated, service_role;
