-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Table: user_profiles
create table if not exists public.user_profiles (
    id uuid not null default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    username text,
    avatar_url text,
    level integer default 1,
    total_xp integer default 0,
    current_streak integer default 0,
    longest_streak integer default 0,
    last_played_date timestamp with time zone,
    completed_algorithms text[] default '{}'::text[],
    algorithm_mastery jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint user_profiles_pkey primary key (id),
    constraint user_profiles_user_id_key unique (user_id)
);

-- Table: daily_quests
create table if not exists public.daily_quests (
    id uuid not null default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    quest_type text not null,
    quest_target text not null,
    target_count integer not null,
    current_count integer default 0,
    xp_reward integer not null,
    is_completed boolean default false,
    quest_date date default CURRENT_DATE,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint daily_quests_pkey primary key (id)
);

-- Table: streak_history
create table if not exists public.streak_history (
    id uuid not null default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    streak_date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint streak_history_pkey primary key (id),
    constraint streak_history_user_date_key unique (user_id, streak_date)
);

-- Set up Row Level Security (RLS)

-- user_profiles policies
alter table public.user_profiles enable row level security;

create policy "Users can view their own profile"
on public.user_profiles for select
using ( auth.uid() = user_id );

create policy "Users can update their own profile"
on public.user_profiles for update
using ( auth.uid() = user_id );

create policy "Users can insert their own profile"
on public.user_profiles for insert
with check ( auth.uid() = user_id );

-- Also allow reading for leaderboard (publicly visible or restricted?)
-- Assuming global leaderboard needs to read username/xp/avatar
create policy "Anyone can view limited profile info for leaderboard"
on public.user_profiles for select
using ( true );

-- daily_quests policies
alter table public.daily_quests enable row level security;

create policy "Users can view their own quests"
on public.daily_quests for select
using ( auth.uid() = user_id );

create policy "Users can update their own quests"
on public.daily_quests for update
using ( auth.uid() = user_id );

create policy "Users can insert their own quests"
on public.daily_quests for insert
with check ( auth.uid() = user_id );

-- streak_history policies
alter table public.streak_history enable row level security;

create policy "Users can view their own streak history"
on public.streak_history for select
using ( auth.uid() = user_id );

create policy "Users can insert their own streak history"
on public.streak_history for insert
with check ( auth.uid() = user_id );

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call handle_new_user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for updating updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_user_profiles_updated_at
    before update on public.user_profiles
    for each row
    execute procedure update_updated_at_column();
