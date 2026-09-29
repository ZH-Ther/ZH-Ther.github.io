-- ZH-Ther Research Site · Supabase schema and row-level security
create extension if not exists pgcrypto;

create table if not exists public.site_profile (
  id text primary key default 'main',
  name text not null default 'ZH-Ther',
  name_en text,
  role text,
  affiliation text,
  email text,
  bio text,
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  email text not null unique,
  github_username text,
  role text not null check (role in ('owner','editor','viewer')),
  status text not null default 'invited' check (status in ('invited','active','revoked')),
  created_at timestamptz not null default now()
);

create table if not exists public.research_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  tags text[] not null default '{}',
  visibility text not null default 'public' check (visibility in ('public','members','private')),
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  type text,
  title text not null,
  authors text,
  venue text,
  links jsonb not null default '[]'::jsonb,
  visibility text not null default 'public' check (visibility in ('public','members','private')),
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  time_label text,
  title text not null,
  description text,
  meta text[] not null default '{}',
  visibility text not null default 'public' check (visibility in ('public','members','private')),
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  tags text[] not null default '{}',
  cover_url text,
  visibility text not null default 'public' check (visibility in ('public','unlisted','members','private')),
  status text not null default 'draft' check (status in ('draft','published')),
  reading_minutes integer not null default 5,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create or replace function public.current_member_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.members where user_id = auth.uid() and status = 'active' limit 1 $$;

create or replace function public.is_active_member()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.members where user_id = auth.uid() and status = 'active') $$;

create or replace function public.claim_github_membership()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  gh_name text := coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'preferred_username');
begin
  if lower(coalesce(gh_name, '')) = 'zh-ther' then
    insert into public.members(user_id, email, github_username, role, status)
    values(new.id, coalesce(new.email, 'zh-ther@users.noreply.github.com'), gh_name, 'owner', 'active')
    on conflict (email) do update set user_id = excluded.user_id, github_username = excluded.github_username, role = 'owner', status = 'active';
  else
    update public.members set user_id = new.id, github_username = gh_name, status = 'active'
    where lower(email) = lower(new.email) and status = 'invited';
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_claim_membership on auth.users;
create trigger on_auth_user_created_claim_membership after insert on auth.users
for each row execute function public.claim_github_membership();

alter table public.site_profile enable row level security;
alter table public.members enable row level security;
alter table public.research_items enable row level security;
alter table public.publications enable row level security;
alter table public.projects enable row level security;
alter table public.posts enable row level security;

drop policy if exists "profile is public" on public.site_profile;
create policy "profile is public" on public.site_profile for select using (true);
drop policy if exists "editors manage profile" on public.site_profile;
create policy "editors manage profile" on public.site_profile for all to authenticated
using (public.current_member_role() in ('owner','editor')) with check (public.current_member_role() in ('owner','editor'));

drop policy if exists "members read own membership" on public.members;
create policy "members read own membership" on public.members for select to authenticated
using (user_id = auth.uid() or public.current_member_role() = 'owner');
drop policy if exists "owner invites members" on public.members;
create policy "owner invites members" on public.members for insert to authenticated
with check (public.current_member_role() = 'owner');
drop policy if exists "owner updates members" on public.members;
create policy "owner updates members" on public.members for update to authenticated
using (public.current_member_role() = 'owner') with check (public.current_member_role() = 'owner');
drop policy if exists "owner removes members" on public.members;
create policy "owner removes members" on public.members for delete to authenticated
using (public.current_member_role() = 'owner');

do $$
declare table_name text;
begin
  foreach table_name in array array['research_items','publications','projects'] loop
    execute format('drop policy if exists "read visible %1$s" on public.%1$I', table_name);
    execute format('create policy "read visible %1$s" on public.%1$I for select using (visibility = ''public'' or (visibility = ''members'' and public.is_active_member()) or (visibility = ''private'' and public.current_member_role() = ''owner''))', table_name);
    execute format('drop policy if exists "create %1$s" on public.%1$I', table_name);
    execute format('create policy "create %1$s" on public.%1$I for insert to authenticated with check (public.current_member_role() = ''owner'' or (public.current_member_role() = ''editor'' and visibility <> ''private''))', table_name);
    execute format('drop policy if exists "update %1$s" on public.%1$I', table_name);
    execute format('create policy "update %1$s" on public.%1$I for update to authenticated using (public.current_member_role() = ''owner'' or (public.current_member_role() = ''editor'' and visibility <> ''private'')) with check (public.current_member_role() = ''owner'' or (public.current_member_role() = ''editor'' and visibility <> ''private''))', table_name);
    execute format('drop policy if exists "delete %1$s" on public.%1$I', table_name);
    execute format('create policy "delete %1$s" on public.%1$I for delete to authenticated using (public.current_member_role() = ''owner'' or (public.current_member_role() = ''editor'' and visibility <> ''private''))', table_name);
  end loop;
end $$;

drop policy if exists "read visible posts" on public.posts;
create policy "read visible posts" on public.posts for select using (
  (status = 'published' and visibility in ('public','unlisted'))
  or (status = 'published' and visibility = 'members' and public.is_active_member())
  or (visibility = 'private' and public.current_member_role() = 'owner')
  or (visibility <> 'private' and public.current_member_role() in ('owner','editor'))
);
drop policy if exists "create posts" on public.posts;
create policy "create posts" on public.posts for insert to authenticated
with check (public.current_member_role() = 'owner' or (public.current_member_role() = 'editor' and visibility <> 'private'));
drop policy if exists "update posts" on public.posts;
create policy "update posts" on public.posts for update to authenticated
using (public.current_member_role() = 'owner' or (public.current_member_role() = 'editor' and visibility <> 'private'))
with check (public.current_member_role() = 'owner' or (public.current_member_role() = 'editor' and visibility <> 'private'));
drop policy if exists "delete posts" on public.posts;
create policy "delete posts" on public.posts for delete to authenticated
using (public.current_member_role() = 'owner' or (public.current_member_role() = 'editor' and visibility <> 'private'));

insert into public.site_profile(id, name, name_en, role, affiliation, email, bio)
values('main', 'ZH-Ther', 'ZH-Ther', '科研工作者', '请在管理后台填写单位与实验室', '', '请在管理后台填写个人简介。')
on conflict (id) do nothing;
