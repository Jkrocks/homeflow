-- HomeFlow security upgrade. Run once in the Supabase SQL editor,
-- after schema.sql. Safe to run again.

-- 1. Tighter rules on what can be stored.
alter table public.items drop constraint if exists items_id_format;
alter table public.items add constraint items_id_format
  check (id ~ '^[A-Za-z0-9_-]{1,120}$') not valid;
alter table public.items drop constraint if exists items_data_size;
alter table public.items add constraint items_data_size
  check (pg_column_size(data) <= 16384) not valid;
alter table public.items drop constraint if exists items_data_object;
alter table public.items add constraint items_data_object
  check (jsonb_typeof(data) = 'object') not valid;

-- Items keep their household forever; nobody can move a row to another home.
create or replace function public.items_lock_household()
returns trigger language plpgsql as $$
begin
  if new.household_id <> old.household_id then
    raise exception 'Items cannot change household';
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists items_lock_household on public.items;
create trigger items_lock_household before update on public.items
  for each row execute function public.items_lock_household();

-- Cap how much one household can store (stops abuse of the free database).
create or replace function public.items_quota()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.items where household_id = new.household_id) >= 20000 then
    raise exception 'Household storage is full';
  end if;
  return new;
end $$;
drop trigger if exists items_quota on public.items;
create trigger items_quota before insert on public.items
  for each row execute function public.items_quota();

-- 2. Stronger join codes: 8 characters, no look-alike letters.
create or replace function public.new_join_code()
returns text language plpgsql volatile set search_path = public as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := '';
    for i in 1..8 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.households where join_code = code);
  end loop;
  return code;
end $$;

create or replace function public.create_household(p_name text)
returns public.households language plpgsql security definer set search_path = public as $$
declare h public.households;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if (select count(*) from public.households where created_by = auth.uid()) >= 5 then
    raise exception 'Too many households';
  end if;
  insert into public.households (name, join_code, created_by)
    values (left(coalesce(nullif(trim(p_name), ''), 'Our home'), 60), public.new_join_code(), auth.uid())
    returning * into h;
  insert into public.household_members (household_id, user_id) values (h.id, auth.uid());
  return h;
end $$;

-- 3. Limit join attempts: 10 per person per hour, so codes can't be guessed.
create table if not exists public.join_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  tried_at timestamptz not null default now()
);
create index if not exists join_attempts_user_idx on public.join_attempts (user_id, tried_at);
alter table public.join_attempts enable row level security;  -- no policies: only the functions below touch it

create or replace function public.join_household(p_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare hh uuid;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  delete from public.join_attempts where tried_at < now() - interval '1 day';
  if (select count(*) from public.join_attempts
      where user_id = auth.uid() and tried_at > now() - interval '1 hour') >= 10 then
    raise exception 'Too many attempts';
  end if;
  insert into public.join_attempts (user_id) values (auth.uid());
  select id into hh from public.households where join_code = upper(trim(coalesce(p_code, '')));
  if hh is null then raise exception 'Household not found'; end if;
  insert into public.household_members (household_id, user_id) values (hh, auth.uid())
    on conflict do nothing;
  return hh;
end $$;

-- 4. Members can replace a leaked join code.
create or replace function public.rotate_join_code(p_household uuid)
returns text language plpgsql security definer set search_path = public as $$
declare code text;
begin
  if not public.is_member(p_household) then raise exception 'Not a member'; end if;
  code := public.new_join_code();
  update public.households set join_code = code where id = p_household;
  return code;
end $$;

-- Move any existing 6-character codes to the stronger format.
update public.households set join_code = public.new_join_code() where char_length(join_code) < 8;

-- 5. Lock down who can call what.
revoke all on function public.create_household(text) from public, anon;
revoke all on function public.join_household(text) from public, anon;
revoke all on function public.rotate_join_code(uuid) from public, anon;
revoke all on function public.new_join_code() from public, anon, authenticated;
revoke all on function public.is_member(uuid) from public, anon;
revoke all on function public.items_quota() from public, anon, authenticated;
grant execute on function public.create_household(text) to authenticated;
grant execute on function public.join_household(text) to authenticated;
grant execute on function public.rotate_join_code(uuid) to authenticated;
grant execute on function public.is_member(uuid) to authenticated;

-- Signed-out visitors get nothing at all.
revoke all on public.households, public.household_members, public.items, public.join_attempts from anon;

-- 6. Clean up deleted entries after 30 days (HomeFlow deletes by marking rows,
--    so that deletions sync to family devices without exposing other homes).
create or replace function public.purge_deleted_items()
returns void language sql security definer set search_path = public as $$
  delete from public.items where data ? '_deleted' and updated_at < now() - interval '30 days';
$$;
revoke all on function public.purge_deleted_items() from public, anon, authenticated;
