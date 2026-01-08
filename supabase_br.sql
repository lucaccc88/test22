-- Create table for tracking BR entries
create table if not exists public.br_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date timestamptz not null,
  type text not null, -- 'TikTok', 'Porno', 'Imagination', 'Départ'
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.br_entries enable row level security;

-- Policies
create policy "Users can view their own entries"
  on public.br_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own entries"
  on public.br_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on public.br_entries for delete
  using (auth.uid() = user_id);

-- Create index for faster sorting/filtering
create index if not exists br_entries_user_id_date_idx on public.br_entries (user_id, date desc);
