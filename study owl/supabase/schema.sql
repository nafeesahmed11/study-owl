-- ============================================================================
-- Study Owl — Supabase schema (paste the WHOLE block into the SQL Editor and
-- run once). Safe to re-run: every object uses "if not exists" / "or replace".
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. profiles — one row per auth user, created automatically at sign-up
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  student_id  text unique,
  full_name   text,
  batch       text,
  department  text,
  role        text not null default 'student' check (role in ('student', 'senior', 'admin')),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Row Level Security — users may only read/update their OWN row.
--    Column grants (not RLS) are what stop a user from self-promoting to
--    admin: `role` simply has no UPDATE grant.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No INSERT/DELETE policies: clients can never create or remove profiles.

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (student_id, full_name, batch, department, avatar_url)
  on table public.profiles to authenticated;
-- `role` deliberately excluded from the UPDATE grant.

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Trigger — create the profile row whenever a new auth user is inserted.
--    Role is ALWAYS 'student' here; metadata can never set it. Admin/senior
--    roles are promoted afterwards with a separate UPDATE (see section 6).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, student_id, full_name, batch, department, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'student_id',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'batch',
    new.raw_user_meta_data ->> 'department',
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Student-ID sign-in helper — resolves a student ID to the account email
--    ONLY when the supplied password matches the stored hash. Returns NULL
--    otherwise, so the client shows a generic "Invalid credentials".
-- ─────────────────────────────────────────────────────────────────────────────
create extension if not exists pgcrypto with schema extensions;

create or replace function public.email_by_student_id(
  p_student_id text,
  p_password   text
)
returns text
language plpgsql
security definer
stable
set search_path = public, extensions, auth
as $$
declare
  v_email text;
begin
  select u.email into v_email
  from auth.users u
  join public.profiles p on p.id = u.id
  where p.student_id = p_student_id
    and u.encrypted_password = extensions.crypt(p_password, u.encrypted_password)
  limit 1;

  return v_email;
end;
$$;

revoke all on function public.email_by_student_id(text, text) from public;
grant execute on function public.email_by_student_id(text, text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. (OPTIONAL) Demo users matching the Login page's quick-fill buttons.
--    The trigger above creates their profile rows as 'student'.
--    Comment this section out for production.
-- ─────────────────────────────────────────────────────────────────────────────
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
       'alex@university.edu', extensions.crypt('student123', extensions.gen_salt('bf')),
       now(), '{"provider":"email","providers":["email"]}'::jsonb,
       '{"full_name":"Alex Johnson","student_id":"CSE-2022-007","department":"CSE","batch":"2022","semester":"6","academic_year":"2022-2026"}'::jsonb,
       now(), now()
where not exists (select 1 from auth.users where email = 'alex@university.edu');

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
       'admin@studyowl.edu', extensions.crypt('admin123', extensions.gen_salt('bf')),
       now(), '{"provider":"email","providers":["email"]}'::jsonb,
       '{"full_name":"Dr. Admin Rahman","student_id":"ADMIN-001","department":"CSE","batch":"Staff","semester":"8","academic_year":"Faculty"}'::jsonb,
       now(), now()
where not exists (select 1 from auth.users where email = 'admin@studyowl.edu');

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Role promotions (run any time — safe to re-run)
-- ─────────────────────────────────────────────────────────────────────────────
update public.profiles p
set role = 'admin'
from auth.users u
where u.id = p.id and u.email = 'admin@studyowl.edu';

-- Example senior promotion (uncomment and adjust the email):
-- update public.profiles p set role = 'senior'
-- from auth.users u where u.id = p.id and u.email = 'some.senior@university.edu';

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Admin read-all — admins may SELECT every profile. The helper is
--    SECURITY DEFINER so its subquery runs as the table owner and bypasses
--    RLS (a same-table subquery inside a profiles policy would recurse).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select to authenticated
  using (public.is_admin());

-- ============================================================================
-- Done. Next: Supabase Dashboard → Authentication → Providers → Email →
-- turn OFF "Confirm email" for easier local testing (the app handles both
-- states), then fill VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.
-- ============================================================================

-- ============================================================================
-- 8. AI Study — agent configuration, credits, chat sessions and messages
--    Depends on section 7 (profiles / is_admin) above. Safe to re-run.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 8.1 ai_agent_config — one row per user (the Developer Mode configuration).
--      `name` is the visible agent prefix, `instructions` are free-form system
--      instructions, `dev_mode` toggles the custom agent in the UI.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.ai_agent_config (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  name         text not null default '',
  instructions text not null default '',
  dev_mode     boolean not null default false,
  updated_at   timestamptz not null default now(),
  provider     text not null default 'openai',
  model        text not null default 'gpt-4o-mini',
  temperature  numeric not null default 0.6,
  command_prefix text not null default '?',
  constraint ai_agent_config_name_len check (char_length(name) <= 30),
  constraint ai_agent_config_instructions_len check (char_length(instructions) <= 1000)
);

alter table public.ai_agent_config enable row level security;

drop policy if exists "ai_agent_config_select_own" on public.ai_agent_config;
create policy "ai_agent_config_select_own" on public.ai_agent_config
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "ai_agent_config_insert_own" on public.ai_agent_config;
create policy "ai_agent_config_insert_own" on public.ai_agent_config
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "ai_agent_config_update_own" on public.ai_agent_config;
create policy "ai_agent_config_update_own" on public.ai_agent_config
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "ai_agent_config_delete_own" on public.ai_agent_config;
create policy "ai_agent_config_delete_own" on public.ai_agent_config
  for delete to authenticated
  using (auth.uid() = user_id);

revoke all on table public.ai_agent_config from anon, authenticated;
grant select, insert, update, delete on table public.ai_agent_config to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8.2 ai_credits — the per-user credit balance.
--      `used` is settled usage; `total` is the granted allowance.
--      In-flight usage lives in ai_credit_reservations (8.4), so two concurrent
--      requests can never spend the same credit twice.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.ai_credits (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  total      integer not null default 1000 check (total >= 0),
  used       integer not null default 0 check (used >= 0),
  updated_at timestamptz not null default now(),
  constraint ai_credits_used_lte_total check (used <= total)
);

alter table public.ai_credits enable row level security;

drop policy if exists "ai_credits_select_own" on public.ai_credits;
create policy "ai_credits_select_own" on public.ai_credits
  for select to authenticated
  using (auth.uid() = user_id);

revoke all on table public.ai_credits from anon, authenticated;
grant select on table public.ai_credits to authenticated;
-- No INSERT/UPDATE/DELETE: the balance only changes through the
-- SECURITY DEFINER reserve/settle functions below.

-- Every new auth user starts with the default allowance.
create or replace function public.handle_new_ai_credits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ai_credits (user_id, total, used)
  values (new.id, 1000, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_ai_credits on auth.users;
create trigger on_auth_user_created_ai_credits
  after insert on auth.users
  for each row execute function public.handle_new_ai_credits();

-- ─────────────────────────────────────────────────────────────────────────────
-- 8.3 ai_chat_sessions / ai_chat_messages — persisted conversations.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.ai_chat_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_chat_sessions_user_updated_idx
  on public.ai_chat_sessions (user_id, updated_at desc);

alter table public.ai_chat_sessions enable row level security;

drop policy if exists "ai_chat_sessions_select_own" on public.ai_chat_sessions;
create policy "ai_chat_sessions_select_own" on public.ai_chat_sessions
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "ai_chat_sessions_insert_own" on public.ai_chat_sessions;
create policy "ai_chat_sessions_insert_own" on public.ai_chat_sessions
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "ai_chat_sessions_update_own" on public.ai_chat_sessions;
create policy "ai_chat_sessions_update_own" on public.ai_chat_sessions
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "ai_chat_sessions_delete_own" on public.ai_chat_sessions;
create policy "ai_chat_sessions_delete_own" on public.ai_chat_sessions
  for delete to authenticated
  using (auth.uid() = user_id);

revoke all on table public.ai_chat_sessions from anon, authenticated;
grant select, insert, update, delete on table public.ai_chat_sessions to authenticated;

create table if not exists public.ai_chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_chat_sessions (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null default '',
  -- Credits charged for this assistant turn (0 for user turns).
  credits    integer not null default 0 check (credits >= 0),
  saved      boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists ai_chat_messages_session_created_idx
  on public.ai_chat_messages (session_id, created_at);

alter table public.ai_chat_messages enable row level security;

drop policy if exists "ai_chat_messages_select_own" on public.ai_chat_messages;
create policy "ai_chat_messages_select_own" on public.ai_chat_messages
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "ai_chat_messages_insert_own" on public.ai_chat_messages;
create policy "ai_chat_messages_insert_own" on public.ai_chat_messages
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "ai_chat_messages_update_own" on public.ai_chat_messages;
create policy "ai_chat_messages_update_own" on public.ai_chat_messages
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "ai_chat_messages_delete_own" on public.ai_chat_messages;
create policy "ai_chat_messages_delete_own" on public.ai_chat_messages
  for delete to authenticated
  using (auth.uid() = user_id);

revoke all on table public.ai_chat_messages from anon, authenticated;
grant select, insert, update, delete on table public.ai_chat_messages to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8.4 ai_credit_reservations — in-flight credit holds.
--      Created before the provider call and either settled (converted into
--      `used`) or released (refunded in full).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.ai_credit_reservations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  amount     integer not null check (amount > 0),
  status     text not null default 'pending' check (status in ('pending', 'settled', 'released')),
  settled_amount integer,
  created_at timestamptz not null default now()
);

create index if not exists ai_credit_reservations_user_status_idx
  on public.ai_credit_reservations (user_id, status);

alter table public.ai_credit_reservations enable row level security;

drop policy if exists "ai_credit_reservations_select_own" on public.ai_credit_reservations;
create policy "ai_credit_reservations_select_own" on public.ai_credit_reservations
  for select to authenticated
  using (auth.uid() = user_id);

revoke all on table public.ai_credit_reservations from anon, authenticated;
grant select on table public.ai_credit_reservations to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8.5 Credit RPCs — atomic reserve / settle / release.
--      1 credit is charged per 100 tokens (prompt + completion).
--      The provider call happens between reserve and settle, so the balance
--      must never be read-modify-written by the client.
-- ─────────────────────────────────────────────────────────────────────────────

-- Reserves `p_amount` credits for the calling user.
-- Returns the reservation id, or NULL when the balance is insufficient.
create or replace function public.ai_reserve_credits(p_amount integer)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_total integer;
  v_used integer;
  v_held integer;
  v_id uuid;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid amount';
  end if;

  -- Make sure the balance row exists (users created before this table).
  insert into public.ai_credits (user_id, total, used)
  values (v_user, 1000, 0)
  on conflict (user_id) do nothing;

  -- Lock the balance row for the duration of the transaction.
  select total, used into v_total, v_used
  from public.ai_credits
  where user_id = v_user
  for update;

  select coalesce(sum(amount), 0) into v_held
  from public.ai_credit_reservations
  where user_id = v_user and status = 'pending';

  if (v_used + v_held + p_amount) > v_total then
    return null;
  end if;

  insert into public.ai_credit_reservations (user_id, amount)
  values (v_user, p_amount)
  returning id into v_id;

  return v_id;
end;
$$;

-- Converts a reservation into settled usage: `p_actual` credits are added to
-- `used` and the remaining hold is released. Returns the new balance.
create or replace function public.ai_settle_credits(p_reservation uuid, p_actual integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_res public.ai_credit_reservations;
  v_actual integer;
  v_total integer;
  v_used integer;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select * into v_res
  from public.ai_credit_reservations
  where id = p_reservation and user_id = v_user
  for update;

  if not found then
    raise exception 'reservation not found';
  end if;

  if v_res.status <> 'pending' then
    -- Already settled/released — report the current balance, no double spend.
    select total, used into v_total, v_used
    from public.ai_credits where user_id = v_user;
    return jsonb_build_object('total', v_total, 'used', v_used, 'charged', 0);
  end if;

  -- The hold becomes usage; never charge more than was reserved.
  v_actual := greatest(0, least(coalesce(p_actual, 0), v_res.amount));

  update public.ai_credit_reservations
  set status = 'settled', settled_amount = v_actual
  where id = p_reservation;

  update public.ai_credits
  set used = least(total, used + v_actual), updated_at = now()
  where user_id = v_user
  returning total, used into v_total, v_used;

  return jsonb_build_object('total', v_total, 'used', v_used, 'charged', v_actual);
end;
$$;

-- Releases a reservation in full — nothing was spent (failed provider call).
create or replace function public.ai_release_credits(p_reservation uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_total integer;
  v_used integer;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  update public.ai_credit_reservations
  set status = 'released'
  where id = p_reservation and user_id = v_user and status = 'pending';

  select total, used into v_total, v_used
  from public.ai_credits where user_id = v_user;

  return jsonb_build_object('total', v_total, 'used', v_used, 'charged', 0);
end;
$$;

-- Current balance for the calling user.
create or replace function public.ai_get_credits()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_total integer;
  v_used integer;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  insert into public.ai_credits (user_id, total, used)
  values (v_user, 1000, 0)
  on conflict (user_id) do nothing;

  select total, used into v_total, v_used
  from public.ai_credits where user_id = v_user;

  return jsonb_build_object('total', v_total, 'used', v_used);
end;
$$;

revoke all on function public.ai_reserve_credits(integer) from public;
revoke all on function public.ai_settle_credits(uuid, integer) from public;
revoke all on function public.ai_release_credits(uuid) from public;
revoke all on function public.ai_get_credits() from public;
grant execute on function public.ai_reserve_credits(integer) to authenticated;
grant execute on function public.ai_settle_credits(uuid, integer) to authenticated;
grant execute on function public.ai_release_credits(uuid) to authenticated;
grant execute on function public.ai_get_credits() to authenticated;

-- ============================================================================
-- 9. AI Study — Edge Function (ai-chat) deployment notes
--    The function source lives in supabase/functions/ai-chat/index.ts.
--    Deploy with:
--      supabase functions deploy ai-chat --no-verify-jwt
--    and set its secrets:
--      supabase secrets set AI_API_KEY=... AI_API_BASE_URL=... AI_MODEL=...
--    The provider key never reaches the browser.
-- ============================================================================

