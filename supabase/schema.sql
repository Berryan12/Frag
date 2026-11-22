-- FRAG mission table and per-user Row Level Security policies.
-- Run this script in Supabase Dashboard -> SQL Editor.

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  reward_points integer not null default 150 check (reward_points >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.missions enable row level security;

create index if not exists missions_user_id_created_at_idx
  on public.missions (user_id, created_at desc);

grant select, insert, update, delete on public.missions to authenticated;

-- Re-create the policies safely if this script is run more than once.
drop policy if exists "Users can read their own missions" on public.missions;
drop policy if exists "Users can create their own missions" on public.missions;
drop policy if exists "Users can update their own missions" on public.missions;
drop policy if exists "Users can delete their own missions" on public.missions;

create policy "Users can read their own missions"
on public.missions
for select
 to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own missions"
on public.missions
for insert
 to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own missions"
on public.missions
for update
 to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own missions"
on public.missions
for delete
 to authenticated
using (auth.uid() = user_id);
