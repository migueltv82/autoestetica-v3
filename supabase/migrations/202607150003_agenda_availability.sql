-- Bloqueos de agenda por vacaciones, feriados, mantenimiento o ausencias.
create table if not exists public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint schedule_blocks_valid_range check (ends_at > starts_at)
);

create index if not exists schedule_blocks_org_range_idx
  on public.schedule_blocks (organization_id, starts_at, ends_at);

alter table public.schedule_blocks enable row level security;
drop policy if exists tenant_access on public.schedule_blocks;
create policy tenant_access on public.schedule_blocks for all to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

