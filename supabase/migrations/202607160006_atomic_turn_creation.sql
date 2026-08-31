-- Crea cliente, vehículo, turno, servicios, pago, movimiento y recibo
-- dentro de una única transacción. Ante cualquier error no deja datos parciales.
create or replace function public.create_scheduled_work_order(
  p_client_name text,
  p_phone text,
  p_vehicle_type text,
  p_status text,
  p_scheduled_start timestamptz,
  p_scheduled_end timestamptz,
  p_notes text,
  p_services jsonb,
  p_register_payment boolean default false,
  p_payment_method text default 'cash',
  p_cash_method text default 'Efectivo'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
  client_record uuid;
  vehicle_record uuid;
  order_record uuid;
  payment_record uuid;
  order_total numeric;
begin
  if target_org is null then raise exception 'Sesión sin organización'; end if;
  if nullif(trim(p_client_name), '') is null then raise exception 'El cliente es obligatorio'; end if;
  if nullif(trim(p_phone), '') is null then raise exception 'El WhatsApp es obligatorio'; end if;
  if p_scheduled_start is null or p_scheduled_end is null or p_scheduled_end <= p_scheduled_start then
    raise exception 'El horario del turno no es válido';
  end if;
  if jsonb_typeof(p_services) <> 'array' or jsonb_array_length(p_services) = 0 then
    raise exception 'Seleccioná al menos un servicio';
  end if;
  if p_status not in ('inquiry','pending','deposit_pending','confirmed','in_progress','ready','delivered','cancelled','no_show') then
    raise exception 'Estado de turno no válido';
  end if;

  if exists (
    select 1 from public.schedule_blocks
    where organization_id = target_org
      and starts_at < p_scheduled_end and ends_at > p_scheduled_start
  ) then raise exception 'Ese horario está bloqueado'; end if;

  if exists (
    select 1 from public.work_orders
    where organization_id = target_org and deleted_at is null
      and status not in ('cancelled','no_show')
      and scheduled_start < p_scheduled_end and scheduled_end > p_scheduled_start
  ) then raise exception 'Ese horario ya está ocupado'; end if;

  select id into client_record
  from public.clients
  where organization_id = target_org and phone = trim(p_phone) and deleted_at is null
  limit 1;

  if client_record is null then
    insert into public.clients(organization_id, name, phone)
    values(target_org, trim(p_client_name), trim(p_phone))
    returning id into client_record;
  else
    update public.clients set name = trim(p_client_name)
    where id = client_record and organization_id = target_org;
  end if;

  select id into vehicle_record
  from public.vehicles
  where organization_id = target_org and client_id = client_record
    and type = trim(p_vehicle_type) and deleted_at is null
  order by created_at desc limit 1;

  if vehicle_record is null then
    insert into public.vehicles(organization_id, client_id, type)
    values(target_org, client_record, trim(p_vehicle_type))
    returning id into vehicle_record;
  end if;

  insert into public.work_orders(
    organization_id, client_id, vehicle_id, status,
    scheduled_start, scheduled_end, notes, created_by
  ) values (
    target_org, client_record, vehicle_record, p_status,
    p_scheduled_start, p_scheduled_end, nullif(trim(p_notes), ''), auth.uid()
  ) returning id into order_record;

  insert into public.work_order_items(
    organization_id, work_order_id, service_id, description, quantity, unit_price
  )
  select
    target_org,
    order_record,
    nullif(item->>'serviceId', '')::uuid,
    left(trim(item->>'name'), 500),
    1,
    greatest(coalesce((item->>'price')::numeric, 0), 0)
  from jsonb_array_elements(p_services) item;

  select total into order_total from public.work_orders where id = order_record;

  if p_register_payment and order_total > 0 then
    insert into public.payments(
      organization_id, work_order_id, client_id, amount, method, kind, created_by
    ) values (
      target_org, order_record, client_record, order_total, p_payment_method, 'payment', auth.uid()
    ) returning id into payment_record;

    insert into public.cash_movements(
      organization_id, payment_id, work_order_id, type, category,
      description, amount, method, created_by
    ) values (
      target_org, payment_record, order_record, 'income', 'Servicios',
      trim(p_client_name) || ' · Turno #' || (select number from public.work_orders where id = order_record),
      order_total, p_cash_method, auth.uid()
    );
  end if;

  perform public.create_receipt_for_order(order_record);
  return order_record;
end;
$$;

revoke all on function public.create_scheduled_work_order(text,text,text,text,timestamptz,timestamptz,text,jsonb,boolean,text,text) from public;
grant execute on function public.create_scheduled_work_order(text,text,text,text,timestamptz,timestamptz,text,jsonb,boolean,text,text) to authenticated;

