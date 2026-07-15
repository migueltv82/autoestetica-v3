-- Autoestética: base operativa multiempresa.
-- Migración aditiva: no elimina la tabla legacy public.turns.
create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'America/Argentina/Tucuman',
  currency text not null default 'ARS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text,
  role text not null default 'owner' check (role in ('owner','admin','employee')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, phone text not null, email text, notes text, tags text[] not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
  unique (organization_id, phone)
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict, type text not null default 'Auto',
  brand text, model text, year integer, license_plate text, color text, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create unique index if not exists vehicles_org_plate_unique on public.vehicles(organization_id, upper(license_plate)) where license_plate is not null and deleted_at is null;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, description text, base_price numeric(12,2) not null default 0 check (base_price >= 0),
  estimated_minutes integer check (estimated_minutes > 0), category text, active boolean not null default true,
  featured boolean not null default false, public_visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);

create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict, vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  number bigint generated always as identity, status text not null default 'pending' check (status in ('inquiry','pending','deposit_pending','confirmed','in_progress','ready','delivered','cancelled','no_show')),
  scheduled_start timestamptz, scheduled_end timestamptz, notes text, internal_notes text,
  subtotal numeric(12,2) not null default 0, discount numeric(12,2) not null default 0, surcharge numeric(12,2) not null default 0,
  total numeric(12,2) generated always as (greatest(subtotal - discount + surcharge, 0)) stored,
  created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create index if not exists work_orders_org_schedule_idx on public.work_orders(organization_id, scheduled_start);

create table if not exists public.work_order_items (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  work_order_id uuid not null references public.work_orders(id) on delete cascade, service_id uuid references public.services(id) on delete set null,
  description text not null, quantity numeric(10,2) not null default 1 check (quantity > 0), unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  total numeric(12,2) generated always as (quantity * unit_price) stored, created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  work_order_id uuid references public.work_orders(id) on delete restrict, client_id uuid references public.clients(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0), method text not null check (method in ('cash','transfer','debit','credit','wallet','other')),
  kind text not null default 'payment' check (kind in ('deposit','payment','refund')), reference text, paid_at timestamptz not null default now(),
  created_by uuid references public.profiles(id), created_at timestamptz not null default now(), voided_at timestamptz, void_reason text
);

create table if not exists public.cash_movements (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete restrict, work_order_id uuid references public.work_orders(id) on delete restrict,
  type text not null check (type in ('income','expense')), category text not null, description text not null,
  amount numeric(12,2) not null check (amount > 0), method text not null, occurred_at timestamptz not null default now(),
  created_by uuid references public.profiles(id), created_at timestamptz not null default now(), voided_at timestamptz, void_reason text
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  work_order_id uuid references public.work_orders(id) on delete restrict, client_id uuid not null references public.clients(id) on delete restrict,
  number bigint generated always as identity, status text not null default 'issued' check (status in ('draft','issued','voided')),
  total numeric(12,2) not null check (total >= 0), payment_status text not null default 'pending' check (payment_status in ('pending','partial','paid','refunded')),
  issued_at timestamptz not null default now(), created_by uuid references public.profiles(id), notes text, created_at timestamptz not null default now(),
  unique(organization_id, number)
);

create table if not exists public.receipt_items (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  receipt_id uuid not null references public.receipts(id) on delete cascade, description text not null,
  quantity numeric(10,2) not null default 1 check (quantity > 0), unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  total numeric(12,2) generated always as (quantity * unit_price) stored
);

create table if not exists public.business_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  business_name text not null, address text, phone text, whatsapp text, email text, logo_url text,
  opening_hours text, instagram text, facebook text, tiktok text, receipt_footer text,
  updated_at timestamptz not null default now()
);

create table if not exists public.work_photos (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  work_order_id uuid not null references public.work_orders(id) on delete cascade, storage_path text not null,
  stage text not null check(stage in ('before','process','after')), caption text, public_visible boolean not null default false,
  publication_consent boolean not null default false, sort_order integer not null default 0, created_at timestamptz not null default now()
);

create or replace function public.current_organization_id() returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.profiles where id = auth.uid() and active = true limit 1
$$;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
do $$ declare table_name text; begin
  foreach table_name in array array['organizations','clients','vehicles','services','work_orders','business_settings'] loop
    execute format('drop trigger if exists touch_updated_at on public.%I', table_name);
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()', table_name);
  end loop;
end $$;

-- Recalcula el subtotal de la orden cuando cambian sus servicios.
create or replace function public.refresh_work_order_subtotal() returns trigger language plpgsql security definer set search_path = public as $$
declare target_id uuid; begin
  target_id := coalesce(new.work_order_id, old.work_order_id);
  update public.work_orders set subtotal = coalesce((select sum(total) from public.work_order_items where work_order_id = target_id), 0) where id = target_id;
  return coalesce(new, old);
end $$;
drop trigger if exists refresh_order_total on public.work_order_items;
create trigger refresh_order_total after insert or update or delete on public.work_order_items for each row execute function public.refresh_work_order_subtotal();

-- RLS: cada usuario sólo puede acceder a los datos de su organización.
do $$ declare table_name text; begin
  foreach table_name in array array['organizations','profiles','clients','vehicles','services','work_orders','work_order_items','payments','cash_movements','receipts','receipt_items','business_settings','work_photos'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists tenant_access on public.%I', table_name);
    if table_name = 'organizations' then
      execute 'create policy tenant_access on public.organizations for all to authenticated using (id = public.current_organization_id()) with check (id = public.current_organization_id())';
    elsif table_name = 'profiles' then
      execute 'create policy tenant_access on public.profiles for all to authenticated using (organization_id = public.current_organization_id()) with check (organization_id = public.current_organization_id())';
    else
      execute format('create policy tenant_access on public.%I for all to authenticated using (organization_id = public.current_organization_id()) with check (organization_id = public.current_organization_id())', table_name);
    end if;
  end loop;
end $$;

-- Storage privado para fotos. Crear el bucket desde SQL si aún no existe.
insert into storage.buckets (id, name, public) values ('work-photos','work-photos',false) on conflict (id) do nothing;
drop policy if exists work_photos_access on storage.objects;
create policy work_photos_access on storage.objects for all to authenticated
using (bucket_id = 'work-photos' and (storage.foldername(name))[1] = public.current_organization_id()::text)
with check (bucket_id = 'work-photos' and (storage.foldername(name))[1] = public.current_organization_id()::text);

comment on table public.work_orders is 'Núcleo operativo: conecta cliente, vehículo, agenda, servicios, pagos, fotos y recibos.';
