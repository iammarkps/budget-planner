insert into public.tax_rules_th (user_id, tax_year, bracket_min, bracket_max, rate)
select
  users.id,
  2024,
  brackets.bracket_min,
  brackets.bracket_max,
  brackets.rate
from auth.users as users
cross join (
  values
    (0, 150000, 0),
    (150000, 300000, 0.05),
    (300000, 500000, 0.1),
    (500000, 750000, 0.15),
    (750000, 1000000, 0.2),
    (1000000, 2000000, 0.25),
    (2000000, 5000000, 0.3),
    (5000000, null, 0.35)
) as brackets(bracket_min, bracket_max, rate)
where not exists (
  select 1
  from public.tax_rules_th existing
  where existing.user_id = users.id
    and existing.tax_year = 2024
);
