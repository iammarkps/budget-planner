-- Run this in Supabase SQL Editor
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14,2) not null,
  currency_code text not null default 'THB',
  merchant text,
  note text,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  day_of_month int,
  day_of_week int,
  start_date date not null,
  end_date date,
  next_occurrence date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_recurring_transactions_updated_at
before update on public.recurring_transactions
for each row execute function public.set_updated_at();

alter table public.recurring_transactions enable row level security;

create policy "recurring_transactions_all" on public.recurring_transactions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists recurring_transactions_user_id_idx on public.recurring_transactions(user_id);
create index if not exists recurring_transactions_next_occurrence_idx on public.recurring_transactions(next_occurrence);