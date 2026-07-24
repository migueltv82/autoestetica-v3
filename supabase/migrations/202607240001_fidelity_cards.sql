-- Sistema de Tarjeta Fidelity (4 + 1 Gratis)
-- Permite registrar y acumular sellos por cada servicio retirado/finalizado.

create table if not exists public.fidelity_cards (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  stamps_count integer not null default 0 check (stamps_count >= 0 and stamps_count <= 4),
  total_stamps integer not null default 4,
  status text not null default 'active' check (status in ('active', 'reward_ready', 'redeemed')),
  reward_description text not null default '5° Lavado Premium Gratis',
  total_rewards_redeemed integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fidelity_stamps (
  id uuid primary key default gen_random_uuid(),
  fidelity_card_id uuid not null references public.fidelity_cards(id) on delete cascade,
  work_order_id uuid references public.work_orders(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.fidelity_cards enable row level security;
alter table public.fidelity_stamps enable row level security;

-- Políticas de RLS
drop policy if exists fidelity_cards_read on public.fidelity_cards;
drop policy if exists fidelity_cards_write on public.fidelity_cards;

create policy fidelity_cards_read on public.fidelity_cards for select to authenticated
using (exists (select 1 from public.clients c where c.id=client_id and c.organization_id=public.current_organization_id()));

create policy fidelity_cards_write on public.fidelity_cards for all to authenticated
using (exists (select 1 from public.clients c where c.id=client_id and c.organization_id=public.current_organization_id()))
with check (exists (select 1 from public.clients c where c.id=client_id and c.organization_id=public.current_organization_id()));

drop policy if exists fidelity_stamps_read on public.fidelity_stamps;
drop policy if exists fidelity_stamps_write on public.fidelity_stamps;

create policy fidelity_stamps_read on public.fidelity_stamps for select to authenticated
using (exists (select 1 from public.fidelity_cards fc join public.clients c on c.id=fc.client_id where fc.id=fidelity_card_id and c.organization_id=public.current_organization_id()));

create policy fidelity_stamps_write on public.fidelity_stamps for all to authenticated
using (exists (select 1 from public.fidelity_cards fc join public.clients c on c.id=fc.client_id where fc.id=fidelity_card_id and c.organization_id=public.current_organization_id()))
with check (exists (select 1 from public.fidelity_cards fc join public.clients c on c.id=fc.client_id where fc.id=fidelity_card_id and c.organization_id=public.current_organization_id()));

create index if not exists fidelity_cards_client_idx on public.fidelity_cards(client_id, status);
create unique index if not exists fidelity_stamps_work_order_unique
on public.fidelity_stamps(work_order_id) where work_order_id is not null;

create or replace function public.lookup_fidelity_card_by_phone(p_phone text)
returns table(client_name text, stamps_count integer, total_stamps integer, status text)
language plpgsql security definer set search_path=public as $$
declare normalized_phone text;
begin
  normalized_phone:=regexp_replace(coalesce(p_phone,''),'\D','','g');
  if normalized_phone !~ '^381[0-9]{7}$' then return; end if;
  return query select c.name,fc.stamps_count,fc.total_stamps,fc.status
  from public.clients c join public.fidelity_cards fc on fc.client_id=c.id
  where c.phone=normalized_phone and c.deleted_at is null and fc.status in ('active','reward_ready')
  order by fc.updated_at desc limit 1;
end $$;

revoke all on function public.lookup_fidelity_card_by_phone(text) from public;
grant execute on function public.lookup_fidelity_card_by_phone(text) to anon,authenticated;
