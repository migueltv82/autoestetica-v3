-- Consolidacion de integridad, precios y seguridad multiempresa.

-- Se repite de forma idempotente para que esta migracion pueda aplicarse sobre instalaciones existentes.
alter table public.services add column if not exists car_price numeric(12,2) check (car_price >= 0);
alter table public.services add column if not exists truck_price numeric(12,2) check (truck_price >= 0);
alter table public.services add column if not exists price_on_request boolean not null default false;

-- Mantiene sincronizados los precios tipados y la configuracion JSON usada por clientes anteriores.
create or replace function public.sync_service_pricing() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.display ? 'carPrice' then
    new.car_price := greatest(coalesce((new.display->>'carPrice')::numeric, 0), 0);
  else
    new.car_price := coalesce(new.car_price, new.base_price, 0);
  end if;
  if new.display ? 'truckPrice' then
    new.truck_price := greatest(coalesce((new.display->>'truckPrice')::numeric, 0), 0);
  else
    new.truck_price := coalesce(new.truck_price, new.base_price, 0);
  end if;
  if new.display ? 'priceOnRequest' then
    new.price_on_request := coalesce((new.display->>'priceOnRequest')::boolean, false);
  end if;
  new.base_price := new.car_price;
  new.display := coalesce(new.display, '{}'::jsonb) || jsonb_build_object(
    'carPrice', new.car_price,
    'truckPrice', new.truck_price,
    'priceOnRequest', new.price_on_request
  );
  return new;
exception when invalid_text_representation then
  raise exception 'Los precios del servicio tienen un formato invalido';
end $$;

drop trigger if exists sync_service_pricing on public.services;
create trigger sync_service_pricing before insert or update on public.services
for each row execute function public.sync_service_pricing();

update public.services set display = display;

-- Evita relaciones cruzadas entre empresas y vehiculos pertenecientes a otro cliente.
create or replace function public.validate_work_order_tenant() returns trigger
language plpgsql set search_path = public as $$
declare client_org uuid; vehicle_org uuid; vehicle_client uuid;
begin
  select organization_id into client_org from public.clients where id = new.client_id and deleted_at is null;
  select organization_id, client_id into vehicle_org, vehicle_client from public.vehicles where id = new.vehicle_id and deleted_at is null;
  if client_org is null or vehicle_org is null then raise exception 'Cliente o vehiculo inexistente'; end if;
  if client_org <> new.organization_id or vehicle_org <> new.organization_id then raise exception 'Cliente, vehiculo y turno deben pertenecer al mismo negocio'; end if;
  if vehicle_client <> new.client_id then raise exception 'El vehiculo no pertenece al cliente seleccionado'; end if;
  return new;
end $$;
drop trigger if exists validate_work_order_tenant on public.work_orders;
create trigger validate_work_order_tenant before insert or update of organization_id,client_id,vehicle_id on public.work_orders
for each row execute function public.validate_work_order_tenant();

create or replace function public.validate_order_item_tenant() returns trigger
language plpgsql set search_path = public as $$
declare order_org uuid; service_org uuid;
begin
  select organization_id into order_org from public.work_orders where id = new.work_order_id;
  if order_org is null or order_org <> new.organization_id then raise exception 'El item y el turno deben pertenecer al mismo negocio'; end if;
  if new.service_id is not null then
    select organization_id into service_org from public.services where id = new.service_id;
    if service_org is null or service_org <> new.organization_id then raise exception 'El servicio no pertenece al negocio del turno'; end if;
  end if;
  return new;
end $$;
drop trigger if exists validate_order_item_tenant on public.work_order_items;
create trigger validate_order_item_tenant before insert or update of organization_id,work_order_id,service_id on public.work_order_items
for each row execute function public.validate_order_item_tenant();

create or replace function public.validate_cash_tenant() returns trigger
language plpgsql set search_path = public as $$
declare related_org uuid;
begin
  if new.work_order_id is not null then
    select organization_id into related_org from public.work_orders where id = new.work_order_id;
    if related_org is null or related_org <> new.organization_id then raise exception 'El movimiento y el turno deben pertenecer al mismo negocio'; end if;
  end if;
  if new.payment_id is not null then
    select organization_id into related_org from public.payments where id = new.payment_id;
    if related_org is null or related_org <> new.organization_id then raise exception 'El movimiento y el pago deben pertenecer al mismo negocio'; end if;
  end if;
  return new;
end $$;
drop trigger if exists validate_cash_tenant on public.cash_movements;
create trigger validate_cash_tenant before insert or update of organization_id,work_order_id,payment_id on public.cash_movements
for each row execute function public.validate_cash_tenant();

create or replace function public.validate_payment_tenant() returns trigger
language plpgsql set search_path = public as $$
declare order_org uuid; order_client uuid; client_org uuid;
begin
  if new.client_id is not null then
    select organization_id into client_org from public.clients where id = new.client_id;
    if client_org is null or client_org <> new.organization_id then raise exception 'El pago y el cliente deben pertenecer al mismo negocio'; end if;
  end if;
  if new.work_order_id is not null then
    select organization_id,client_id into order_org,order_client from public.work_orders where id = new.work_order_id;
    if order_org is null or order_org <> new.organization_id then raise exception 'El pago y el turno deben pertenecer al mismo negocio'; end if;
    if new.client_id is not null and order_client <> new.client_id then raise exception 'El pago no corresponde al cliente del turno'; end if;
  end if;
  return new;
end $$;
drop trigger if exists validate_payment_tenant on public.payments;
create trigger validate_payment_tenant before insert or update of organization_id,work_order_id,client_id on public.payments
for each row execute function public.validate_payment_tenant();

create or replace function public.validate_receipt_tenant() returns trigger
language plpgsql set search_path = public as $$
declare related_org uuid; order_client uuid;
begin
  select organization_id into related_org from public.clients where id = new.client_id;
  if related_org is null or related_org <> new.organization_id then raise exception 'El recibo y el cliente deben pertenecer al mismo negocio'; end if;
  if new.work_order_id is not null then
    select organization_id,client_id into related_org,order_client from public.work_orders where id = new.work_order_id;
    if related_org is null or related_org <> new.organization_id then raise exception 'El recibo y el turno deben pertenecer al mismo negocio'; end if;
    if order_client <> new.client_id then raise exception 'El recibo no corresponde al cliente del turno'; end if;
  end if;
  return new;
end $$;
drop trigger if exists validate_receipt_tenant on public.receipts;
create trigger validate_receipt_tenant before insert or update of organization_id,work_order_id,client_id on public.receipts
for each row execute function public.validate_receipt_tenant();

create or replace function public.validate_receipt_item_tenant() returns trigger
language plpgsql set search_path = public as $$
declare receipt_org uuid;
begin
  select organization_id into receipt_org from public.receipts where id = new.receipt_id;
  if receipt_org is null or receipt_org <> new.organization_id then raise exception 'El item y el recibo deben pertenecer al mismo negocio'; end if;
  return new;
end $$;
drop trigger if exists validate_receipt_item_tenant on public.receipt_items;
create trigger validate_receipt_item_tenant before insert or update of organization_id,receipt_id on public.receipt_items
for each row execute function public.validate_receipt_item_tenant();

create index if not exists clients_org_active_idx on public.clients(organization_id, created_at desc) where deleted_at is null;
create index if not exists vehicles_client_active_idx on public.vehicles(organization_id, client_id) where deleted_at is null;
create index if not exists services_org_active_idx on public.services(organization_id, created_at) where deleted_at is null;
create index if not exists work_orders_org_status_idx on public.work_orders(organization_id, status) where deleted_at is null;
create index if not exists cash_movements_org_date_idx on public.cash_movements(organization_id, occurred_at desc) where voided_at is null;
create index if not exists portfolio_org_status_idx on public.portfolio_items(organization_id, status, created_at desc) where deleted_at is null;

-- Endurece la funcion publica y limita cargas abusivas.
create or replace function public.submit_inquiry(
  business_slug text, client_name text, client_phone text, vehicle_type text,
  requested_services text[], inquiry_notes text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare org_id uuid; client_record uuid; vehicle_record uuid; order_record uuid; service_name text;
begin
  select id into org_id from public.organizations where slug = business_slug;
  if org_id is null then raise exception 'Negocio no encontrado'; end if;
  if length(trim(client_name)) not between 2 and 100 or length(regexp_replace(client_phone, '\D','','g')) not between 8 and 15 then raise exception 'Datos de contacto invalidos'; end if;
  if vehicle_type not in ('Auto','Camioneta','SUV','Moto','Bicicleta') then raise exception 'Tipo de vehiculo invalido'; end if;
  if coalesce(array_length(requested_services,1),0) not between 1 and 8 then raise exception 'Seleccion de servicios invalida'; end if;

  insert into public.clients (organization_id,name,phone)
  values (org_id,trim(client_name),regexp_replace(client_phone,'\s','','g'))
  on conflict (organization_id,phone) do update set name = excluded.name, updated_at = now()
  returning id into client_record;
  select id into vehicle_record from public.vehicles where organization_id=org_id and client_id=client_record and type=vehicle_type and deleted_at is null limit 1;
  if vehicle_record is null then insert into public.vehicles(organization_id,client_id,type) values(org_id,client_record,vehicle_type) returning id into vehicle_record; end if;
  insert into public.work_orders(organization_id,client_id,vehicle_id,status,notes) values(org_id,client_record,vehicle_record,'inquiry',left(coalesce(inquiry_notes,'Consulta desde la web'),1000)) returning id into order_record;
  foreach service_name in array requested_services loop
    if length(trim(service_name)) between 2 and 120 then insert into public.work_order_items(organization_id,work_order_id,description,quantity,unit_price) values(org_id,order_record,trim(service_name),1,0); end if;
  end loop;
  return order_record;
end $$;
revoke all on function public.submit_inquiry(text,text,text,text,text[],text) from public;
grant execute on function public.submit_inquiry(text,text,text,text,text[],text) to anon, authenticated;

comment on function public.validate_work_order_tenant() is 'Impide relaciones cruzadas entre organizaciones y valida propiedad del vehiculo.';
