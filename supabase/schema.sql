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

create table if not exists public.site_settings (
  id text primary key default 'main',
  site_title text not null default 'ZH-Ther · 个人科研主页',
  site_description text not null default '个人科研主页，汇集研究方向、论文成果、科研项目与学术笔记。',
  hero_kicker text not null default 'Academic portfolio · 2026',
  hero_prefix text not null default '探索智能系统中',
  hero_emphasis text not null default '可解释、可靠且高效',
  hero_suffix text not null default '的计算方法。',
  status_text text not null default '开放学术交流与合作',
  scholar_url text,
  github_url text,
  orcid_url text,
  avatar_url text,
  footer_motto text not null default '保持好奇，持续记录。',
  research_description text not null default '围绕“可信智能”这条主线，从方法、系统到科学应用展开研究。',
  publications_description text not null default '代表性论文与正在推进的工作。姓名下划线表示本人。',
  projects_description text not null default '把研究问题落实为数据、模型与可复现的工具。',
  notes_description text not null default '记录论文阅读、研究方法与工程实践。',
  metric_1_value text not null default '08',
  metric_1_label text not null default '论文 / 预印本',
  metric_2_value text not null default '04',
  metric_2_label text not null default '研究项目',
  metric_3_value text not null default '03',
  metric_3_label text not null default '开源工具',
  metric_4_value text not null default '12',
  metric_4_label text not null default '学术笔记',
  module_order text[] not null default array['about','research','publications','projects','notes'],
  hidden_modules text[] not null default '{}',
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
alter table public.site_settings enable row level security;
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

drop policy if exists "settings are public" on public.site_settings;
create policy "settings are public" on public.site_settings for select using (true);
drop policy if exists "editors manage settings" on public.site_settings;
create policy "editors manage settings" on public.site_settings for all to authenticated
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

insert into public.site_settings(id, scholar_url, github_url, orcid_url)
values('main', 'https://scholar.google.com', 'https://github.com/ZH-Ther', 'https://orcid.org')
on conflict (id) do nothing;

-- Public avatar storage. Upload and deletion still require an owner/editor session.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values('site-assets', 'site-assets', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public reads site assets" on storage.objects;
create policy "public reads site assets" on storage.objects for select
using (bucket_id = 'site-assets');
drop policy if exists "editors upload site assets" on storage.objects;
create policy "editors upload site assets" on storage.objects for insert to authenticated
with check (bucket_id = 'site-assets' and public.current_member_role() in ('owner','editor'));
drop policy if exists "editors update site assets" on storage.objects;
create policy "editors update site assets" on storage.objects for update to authenticated
using (bucket_id = 'site-assets' and public.current_member_role() in ('owner','editor'))
with check (bucket_id = 'site-assets' and public.current_member_role() in ('owner','editor'));
drop policy if exists "editors delete site assets" on storage.objects;
create policy "editors delete site assets" on storage.objects for delete to authenticated
using (bucket_id = 'site-assets' and public.current_member_role() in ('owner','editor'));
