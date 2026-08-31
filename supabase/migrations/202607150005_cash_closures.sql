-- Cierres diarios de caja por negocio.
create table if not exists public.cash_closures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  closure_date date not null,
  income_total numeric(12,2) not null default 0 check (income_total >= 0),
  expense_total numeric(12,2) not null default 0 check (expense_total >= 0),
  balance_total numeric(12,2) not null default 0,
  movement_count integer not null default 0 check (movement_count >= 0),
  notes text,
  closed_by uuid references public.profiles(id),
  closed_at timestamptz not null default now(),
  unique (organization_id, closure_date)
);

alter table public.cash_closures enable row level security;
drop policy if exists tenant_access on public.cash_closures;
create policy tenant_access on public.cash_closures for all to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create index if not exists cash_closures_org_date_idx
on public.cash_closures (organization_id, closure_date desc);

