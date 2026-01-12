create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  base_currency text not null default 'THB',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  currency_code text not null default 'THB',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  parent_id uuid references public.categories(id) on delete set null,
  is_system boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tax_deductions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  description text,
  cap_amount numeric(14,2),
  cap_percent numeric(6,4),
  tax_year int not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tax_rules_th (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tax_year int not null,
  bracket_min numeric(14,2) not null,
  bracket_max numeric(14,2),
  rate numeric(6,4) not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month date not null,
  amount numeric(14,2) not null,
  rollover boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  base_currency text not null default 'THB',
  quote_currency text not null,
  rate numeric(14,6) not null,
  rate_date date not null,
  source text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  tax_deduction_id uuid references public.tax_deductions(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount_original numeric(14,2) not null,
  currency_code text not null,
  amount_base_thb numeric(14,2) not null,
  rate_used numeric(14,6) not null,
  merchant text,
  note text,
  occurred_at date not null,
  raw_nl_input text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transaction_tags (
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (transaction_id, tag_id)
);

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create trigger set_accounts_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger set_tax_deductions_updated_at
before update on public.tax_deductions
for each row execute function public.set_updated_at();

create trigger set_budgets_updated_at
before update on public.budgets
for each row execute function public.set_updated_at();

create trigger set_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

alter table public.user_profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.tax_deductions enable row level security;
alter table public.tax_rules_th enable row level security;
alter table public.budgets enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_tags enable row level security;

create policy "profiles_select" on public.user_profiles
for select using (auth.uid() = id);

create policy "profiles_upsert" on public.user_profiles
for insert with check (auth.uid() = id);

create policy "profiles_update" on public.user_profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "accounts_all" on public.accounts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "categories_all" on public.categories
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tags_all" on public.tags
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tax_deductions_all" on public.tax_deductions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tax_rules_all" on public.tax_rules_th
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets_all" on public.budgets
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "exchange_rates_all" on public.exchange_rates
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_all" on public.transactions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transaction_tags_all" on public.transaction_tags
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists accounts_user_id_idx on public.accounts(user_id);
create index if not exists categories_user_id_idx on public.categories(user_id);
create index if not exists tags_user_id_idx on public.tags(user_id);
create index if not exists budgets_user_id_idx on public.budgets(user_id);
create index if not exists budgets_month_idx on public.budgets(month);
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_occurred_at_idx on public.transactions(occurred_at);
create index if not exists exchange_rates_user_id_idx on public.exchange_rates(user_id);
create index if not exists exchange_rates_rate_date_idx on public.exchange_rates(rate_date);
create index if not exists tax_rules_th_year_idx on public.tax_rules_th(tax_year);
