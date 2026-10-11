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
