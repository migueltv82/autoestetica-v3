-- [ANTI-SPAM] La consulta pública solo se ejecuta desde la Edge Function con CAPTCHA.

create table if not exists public.public_inquiry_attempts (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  normalized_phone text not null,
  created_at timestamptz not null default now()
);
create index if not exists public_inquiry_attempts_lookup_idx
  on public.public_inquiry_attempts(organization_id,normalized_phone,created_at desc);
alter table public.public_inquiry_attempts enable row level security;

create or replace function public.submit_inquiry(
  business_slug text, client_name text, client_phone text, vehicle_type text,
  requested_services text[], inquiry_notes text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  org_id uuid; client_record uuid; vehicle_record uuid; order_record uuid; service_name text;
  target_phone text := regexp_replace(coalesce(client_phone,''),'\D','','g');
begin
  select id into org_id from public.organizations where slug=business_slug;
  if org_id is null then raise exception 'Negocio no encontrado'; end if;
  if length(trim(client_name)) not between 2 and 100 or length(target_phone) not between 8 and 15 then raise exception 'Datos de contacto inválidos'; end if;
  if vehicle_type not in ('Auto','Camioneta','SUV','Moto','Bicicleta') then raise exception 'Tipo de vehículo inválido'; end if;
  if coalesce(array_length(requested_services,1),0) not between 1 and 8 then raise exception 'Selección de servicios inválida'; end if;

  perform pg_advisory_xact_lock(hashtextextended(org_id::text || ':' || target_phone,0));
  if exists (
    select 1 from public.public_inquiry_attempts
    where organization_id=org_id and normalized_phone=target_phone
      and created_at > now()-interval '45 seconds'
  ) then raise exception 'Esperá un momento antes de enviar otra consulta' using errcode='P0001'; end if;
  if (select count(*) from public.public_inquiry_attempts
      where organization_id=org_id and normalized_phone=target_phone
        and created_at > now()-interval '1 hour') >= 3
  then raise exception 'Alcanzaste el límite de consultas por hora' using errcode='P0001'; end if;
  if (select count(*) from public.public_inquiry_attempts
      where organization_id=org_id and normalized_phone=target_phone
        and created_at > now()-interval '1 day') >= 8
  then raise exception 'Alcanzaste el límite diario de consultas' using errcode='P0001'; end if;

  insert into public.clients(organization_id,name,phone,directory_visible)
  values(org_id,trim(client_name),target_phone,false)
  on conflict (organization_id,phone) where deleted_at is null do update
    set name=excluded.name,updated_at=now()
  returning id into client_record;
  select id into vehicle_record from public.vehicles
    where organization_id=org_id and client_id=client_record and type=vehicle_type and deleted_at is null limit 1;
  if vehicle_record is null then
    insert into public.vehicles(organization_id,client_id,type)
    values(org_id,client_record,vehicle_type) returning id into vehicle_record;
  end if;
  insert into public.work_orders(organization_id,client_id,vehicle_id,status,notes)
  values(org_id,client_record,vehicle_record,'inquiry',left(coalesce(inquiry_notes,'Consulta desde la web'),1000))
  returning id into order_record;
  foreach service_name in array requested_services loop
    if length(trim(service_name)) between 2 and 120 then
      insert into public.work_order_items(organization_id,work_order_id,description,quantity,unit_price)
      values(org_id,order_record,trim(service_name),1,0);
    end if;
  end loop;
  insert into public.public_inquiry_attempts(organization_id,normalized_phone) values(org_id,target_phone);
  delete from public.public_inquiry_attempts where created_at < now()-interval '30 days';
  return order_record;
end $$;

revoke all on function public.submit_inquiry(text,text,text,text,text[],text) from public;
grant execute on function public.submit_inquiry(text,text,text,text,text[],text) to service_role;
