-- Allow users to delete their own chat messages
create policy "Users can delete their own chat messages"
  on chat_messages for delete
  using ( auth.uid() = user_id );

-- Ensure RLS is enabled
alter table chat_messages enable row level security;
