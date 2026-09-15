create table if not exists lucky_tokens (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id),
  token_number serial,
  name text not null,
  phone text,
  created_at timestamptz default now()
);
