-- Create user_balances table
create table user_balances (
  user_id uuid references auth.users not null primary key,
  amount numeric not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_balances enable row level security;

-- Policies
create policy "Users can view their own balance"
  on user_balances for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own balance"
  on user_balances for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own balance"
  on user_balances for update
  using ( auth.uid() = user_id );
