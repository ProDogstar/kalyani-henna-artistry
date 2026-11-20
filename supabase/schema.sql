-- Run once: Supabase dashboard > SQL Editor > paste > Run.
create extension if not exists pgcrypto;
create table admins (user_id uuid primary key references auth.users(id) on delete cascade);
create function is_admin() returns boolean language sql security definer stable as
  $$ select exists (select 1 from admins where user_id = auth.uid()) $$;

create table bookings (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  name text not null, phone text not null, email text,
  service text not null, event_type text, event_date date not null, slot text,
  venue text, notes text,
  advance_paise int, razorpay_order_id text unique, hold_expires_at timestamptz,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed','expired','quote')),
  created_at timestamptz not null default now()
);
-- One live booking per date+time. Blocks double booking even if two people pay at once.
create unique index one_booking_per_slot on bookings (event_date, slot) where status in ('pending','confirmed');
create index on bookings (event_date);

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  razorpay_payment_id text unique not null,   -- UNIQUE = duplicate notifications are ignored
  amount_paise int, status text, created_at timestamptz not null default now()
);
create table portfolio (id uuid primary key default gen_random_uuid(), path text not null, title text, category text, created_at timestamptz not null default now());

-- Row level security: the public site can only READ portfolio. Customers never touch tables directly:
-- bookings are written by /api/* using the secret service key. Only admins can read bookings/payments.
alter table admins enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table portfolio enable row level security;
create policy "admin read bookings" on bookings for select using (is_admin());
create policy "admin update bookings" on bookings for update using (is_admin());
create policy "admin read payments" on payments for select using (is_admin());
create policy "public read portfolio" on portfolio for select using (true);
create policy "admin write portfolio" on portfolio for all using (is_admin()) with check (is_admin());

insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true) on conflict do nothing;
create policy "admin upload photos" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio' and is_admin());
create policy "admin delete photos" on storage.objects for delete to authenticated using (bucket_id = 'portfolio' and is_admin());

-- Create the first admin: sign up the user in Supabase > Authentication > Users, then run:
-- insert into admins (user_id) select id from auth.users where email = 'owner@example.com';
