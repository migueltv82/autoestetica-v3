-- Club de Usuarios / Membresías.
-- Idempotente y listo para ejecutar en Supabase SQL Editor.
--
-- Seguridad:
-- - La landing pública puede leer planes.
-- - Solo usuarios incluidos en public.admins pueden crear, editar o borrar planes.
-- - Nunca se usa SERVICE_ROLE_KEY desde el cliente.

create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.club_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  price numeric(10,2) not null check (price >= 0),
  currency text not null default 'ARS',
  features text[] not null default '{}',
  checkout_url text,
  fidelity_card_active boolean not null default false,
  is_active boolean not null default false,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid null
);

alter table public.admins enable row level security;
alter table public.club_plans enable row level security;

create or replace function public.is_club_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_club_admin() from public;
grant execute on function public.is_club_admin() to authenticated;

create or replace function public.touch_club_plan_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists touch_club_plan_audit on public.club_plans;
create trigger touch_club_plan_audit
before insert or update on public.club_plans
for each row execute function public.touch_club_plan_audit();

drop policy if exists admins_self_read on public.admins;
drop policy if exists admins_admin_insert on public.admins;
drop policy if exists admins_admin_delete on public.admins;

create policy admins_self_read on public.admins
for select to authenticated
using (user_id = auth.uid());

create policy admins_admin_insert on public.admins
for insert to authenticated
with check (public.is_club_admin());

create policy admins_admin_delete on public.admins
for delete to authenticated
using (public.is_club_admin());

drop policy if exists public_club_plans_read on public.club_plans;
drop policy if exists club_plans_admin_insert on public.club_plans;
drop policy if exists club_plans_admin_update on public.club_plans;
drop policy if exists club_plans_admin_delete on public.club_plans;

create policy public_club_plans_read on public.club_plans
for select to anon, authenticated
using (true);

create policy club_plans_admin_insert on public.club_plans
for insert to authenticated
with check (public.is_club_admin());

create policy club_plans_admin_update on public.club_plans
for update to authenticated
using (public.is_club_admin())
with check (public.is_club_admin());

create policy club_plans_admin_delete on public.club_plans
for delete to authenticated
using (public.is_club_admin());

create index if not exists club_plans_active_created_idx
on public.club_plans(is_active, created_at desc);

comment on table public.admins is 'Usuarios autorizados a administrar Club de Usuarios. Cargar auth.uid() real del owner/admin.';
comment on table public.club_plans is 'Planes dinámicos de membresía para landing pública y panel admin.';

-- Seed demo: reemplazar este user_id por el auth.uid() real del administrador
-- antes de producción. Si dejás este UUID, solo sirve como ejemplo documental.
insert into public.admins (user_id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (user_id) do nothing;

insert into public.club_plans (
  id,
  title,
  subtitle,
  price,
  currency,
  features,
  checkout_url,
  fidelity_card_active,
  is_active,
  image_url
) values (
  '11111111-1111-1111-1111-111111111111',
  'Club Autoestética Premium',
  'Beneficios exclusivos para clientes que quieren mantener su vehículo siempre impecable.',
  25000,
  'ARS',
  array[
    'Prioridad para conseguir turnos',
    'Precio preferencial en Lavado Premium',
    'Control periódico del estado exterior e interior',
    'Acceso anticipado a promociones del taller'
  ],
  null,
  true,
  false,
  null
)
on conflict (id) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  price = excluded.price,
  currency = excluded.currency,
  features = excluded.features,
  checkout_url = excluded.checkout_url,
  fidelity_card_active = excluded.fidelity_card_active,
  is_active = excluded.is_active,
  image_url = excluded.image_url;

-- Query pública landing:
-- select * from public.club_plans where is_active = true order by created_at desc;
--
-- Upsert admin ejemplo:
-- insert into public.club_plans(title, subtitle, price, currency, features, checkout_url, fidelity_card_active, is_active)
-- values ('Club Autoestética Premium', 'Cuidado recurrente', 25000, 'ARS', array['Prioridad', 'Fidelity'], 'https://...', true, true)
-- on conflict (id) do update set
--   title = excluded.title,
--   subtitle = excluded.subtitle,
--   price = excluded.price,
--   currency = excluded.currency,
--   features = excluded.features,
--   checkout_url = excluded.checkout_url,
--   fidelity_card_active = excluded.fidelity_card_active,
--   is_active = excluded.is_active;
