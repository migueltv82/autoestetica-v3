-- Catálogo, portfolio y lectura pública segura.
alter table public.services add column if not exists duration_label text;
alter table public.services add column if not exists icon_name text not null default 'Zap';
alter table public.services add column if not exists cover_image_url text;
alter table public.services add column if not exists display jsonb not null default '{"name":true,"description":true,"gallery":true,"duration":true,"price":true}'::jsonb;
alter table public.services add column if not exists gallery jsonb not null default '[]'::jsonb;

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null, service_name text not null, before_path text, after_path text not null,
  status text not null default 'published' check (status in ('draft','published')),
  publication_consent boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
drop trigger if exists touch_updated_at on public.portfolio_items;
create trigger touch_updated_at before update on public.portfolio_items for each row execute function public.touch_updated_at();
alter table public.portfolio_items enable row level security;
drop policy if exists tenant_access on public.portfolio_items;
create policy tenant_access on public.portfolio_items for all to authenticated
using (organization_id = public.current_organization_id()) with check (organization_id = public.current_organization_id());

-- Sólo identidad comercial y catálogo publicado son visibles sin login.
drop policy if exists public_org_read on public.organizations;
create policy public_org_read on public.organizations for select to anon using (true);
drop policy if exists public_settings_read on public.business_settings;
create policy public_settings_read on public.business_settings for select to anon using (true);
drop policy if exists public_services_read on public.services;
create policy public_services_read on public.services for select to anon using (active = true and public_visible = true and deleted_at is null);
drop policy if exists public_portfolio_read on public.portfolio_items;
create policy public_portfolio_read on public.portfolio_items for select to anon using (status = 'published' and publication_consent = true and deleted_at is null);

-- Las consultas públicas entran mediante una función controlada, sin acceso directo a clientes u órdenes.
create or replace function public.submit_inquiry(
  business_slug text, client_name text, client_phone text, vehicle_type text,
  requested_services text[], inquiry_notes text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare org_id uuid; client_record uuid; vehicle_record uuid; order_record uuid; service_name text;
begin
  select id into org_id from public.organizations where slug = business_slug;
  if org_id is null then raise exception 'Negocio no encontrado'; end if;
  if length(trim(client_name)) < 2 or length(regexp_replace(client_phone, '\D','','g')) < 8 then raise exception 'Datos de contacto inválidos'; end if;

  insert into public.clients (organization_id,name,phone)
  values (org_id,trim(client_name),regexp_replace(client_phone,'\s','','g'))
  on conflict (organization_id,phone) do update set name = excluded.name, updated_at = now()
  returning id into client_record;

  select id into vehicle_record from public.vehicles
  where organization_id = org_id and client_id = client_record and type = vehicle_type and deleted_at is null limit 1;
  if vehicle_record is null then
    insert into public.vehicles (organization_id,client_id,type) values (org_id,client_record,vehicle_type) returning id into vehicle_record;
  end if;

  insert into public.work_orders (organization_id,client_id,vehicle_id,status,notes)
  values (org_id,client_record,vehicle_record,'inquiry',coalesce(inquiry_notes,'Consulta desde la web')) returning id into order_record;
  foreach service_name in array requested_services loop
    insert into public.work_order_items (organization_id,work_order_id,description,quantity,unit_price)
    values (org_id,order_record,service_name,1,0);
  end loop;
  return order_record;
end $$;
revoke all on function public.submit_inquiry(text,text,text,text,text[],text) from public;
grant execute on function public.submit_inquiry(text,text,text,text,text[],text) to anon, authenticated;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio','portfolio',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists portfolio_admin_access on storage.objects;
create policy portfolio_admin_access on storage.objects for all to authenticated
using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = public.current_organization_id()::text)
with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = public.current_organization_id()::text);
