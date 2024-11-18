-- Enable RLS
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  phone_number text,
  last_seen timestamp with time zone default timezone('utc'::text, now()) not null,
  is_online boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text,
  content_type text check (content_type in ('text', 'image', 'file')) default 'text',
  file_url text,
  file_type text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

-- Create contacts table
create table public.contacts (
  user_id uuid references public.profiles(id) on delete cascade not null,
  contact_id uuid references public.profiles(id) on delete cascade not null,
  phone_number text,
  contact_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, contact_id)
);

-- Set up RLS policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Messages policies
create policy "Users can view messages they're involved in."
  on messages for select
  using ( auth.uid() = sender_id or auth.uid() = receiver_id );

create policy "Users can insert messages."
  on messages for insert
  with check ( auth.uid() = sender_id );

create policy "Users can update their own messages."
  on messages for update
  using ( auth.uid() = sender_id );

-- Contacts policies
create policy "Users can view their contacts."
  on contacts for select
  using ( auth.uid() = user_id );

create policy "Users can insert contacts."
  on contacts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their contacts."
  on contacts for update
  using ( auth.uid() = user_id );

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.contacts enable row level security; 