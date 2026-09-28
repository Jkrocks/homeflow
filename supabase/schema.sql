-- HomeFlow database schema for Supabase
-- Run once in the Supabase SQL editor (or via the Supabase connector).

-- A household is one shared notebook (a family, couple, flat, or one person).
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  join_code text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Which signed-in people belong to which household.
create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- Every record in the app (expenses, bills, tasks, shopping items, goals,
-- family members, custom categories and settings) is one row here.
create table if not exists public.items (
  household_id uuid not null references public.households(id) on delete cascade,
  col text not null check (col in ('expenses','bills','tasks','shop','goals','members','cats','settings')),
  id text not null check (char_length(id) between 1 and 120),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (household_id, col, id)
);
create index if not exists items_household_idx on public.items (household_id);

-- Membership check used by the security rules below.
create or replace function public.is_member(hh uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.household_members m where m.household_id = hh and m.user_id = auth.uid());
$$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.items enable row level security;

drop policy if exists "members read household" on public.households;
create policy "members read household" on public.households
  for select to authenticated using (public.is_member(id));

drop policy if exists "members read membership" on public.household_members;
create policy "members read membership" on public.household_members
  for select to authenticated using (user_id = auth.uid() or public.is_member(household_id));

drop policy if exists "members leave household" on public.household_members;
create policy "members leave household" on public.household_members
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "members read items" on public.items;
create policy "members read items" on public.items
  for select to authenticated using (public.is_member(household_id));
drop policy if exists "members add items" on public.items;
create policy "members add items" on public.items
  for insert to authenticated with check (public.is_member(household_id));
drop policy if exists "members change items" on public.items;
create policy "members change items" on public.items
  for update to authenticated using (public.is_member(household_id)) with check (public.is_member(household_id));
drop policy if exists "members delete items" on public.items;
create policy "members delete items" on public.items
  for delete to authenticated using (public.is_member(household_id));

-- Create a household and make the caller its first member.
create or replace function public.create_household(p_name text)
returns public.households language plpgsql security definer set search_path = public as $$
declare
  h public.households;
  code text;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  loop
    code := upper(substr(translate(md5(random()::text || clock_timestamp()::text), '01', ''), 1, 6));
    exit when char_length(code) = 6 and not exists (select 1 from public.households where join_code = code);
  end loop;
  insert into public.households (name, join_code, created_by)
    values (coalesce(nullif(trim(p_name), ''), 'Our home'), code, auth.uid())
    returning * into h;
  insert into public.household_members (household_id, user_id) values (h.id, auth.uid());
  return h;
end $$;

-- Join an existing household with its join code.
create or replace function public.join_household(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare hh uuid;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select id into hh from public.households where join_code = upper(trim(p_code));
  if hh is null then raise exception 'Household not found'; end if;
  insert into public.household_members (household_id, user_id) values (hh, auth.uid())
    on conflict do nothing;
  return hh;
end $$;

revoke all on function public.create_household(text) from public, anon;
revoke all on function public.join_household(text) from public, anon;
grant execute on function public.create_household(text) to authenticated;
grant execute on function public.join_household(text) to authenticated;

-- Live sync between family members' devices.
do $$ begin
  alter publication supabase_realtime add table public.items;
exception when duplicate_object then null; end $$;
