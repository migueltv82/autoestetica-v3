-- Actualiza turno, cliente, vehículo y servicios en una sola transacción.
create or replace function public.update_scheduled_work_order(
  p_order_id uuid,
  p_client_name text,
  p_phone text,
  p_vehicle_type text,
  p_status text,
  p_scheduled_start timestamptz,
  p_scheduled_end timestamptz,
  p_notes text,
  p_services jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
  order_row public.work_orders%rowtype;
begin
  if target_org is null then raise exception 'Sesión sin organización'; end if;

  select * into order_row
  from public.work_orders
  where id = p_order_id and organization_id = target_org and deleted_at is null
  for update;

  if order_row.id is null then raise exception 'Turno inexistente'; end if;
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
    where organization_id = target_org and deleted_at is null and id <> p_order_id
      and status not in ('cancelled','no_show')
      and scheduled_start < p_scheduled_end and scheduled_end > p_scheduled_start
  ) then raise exception 'Ese horario ya está ocupado'; end if;

  update public.clients
  set name = trim(p_client_name), phone = trim(p_phone)
  where id = order_row.client_id and organization_id = target_org;

  update public.vehicles
  set type = trim(p_vehicle_type)
  where id = order_row.vehicle_id and organization_id = target_org;

  update public.work_orders
  set status = p_status,
      scheduled_start = p_scheduled_start,
      scheduled_end = p_scheduled_end,
      notes = nullif(trim(p_notes), '')
  where id = p_order_id and organization_id = target_org;

  delete from public.work_order_items
  where work_order_id = p_order_id and organization_id = target_org;

  insert into public.work_order_items(
    organization_id, work_order_id, service_id, description, quantity, unit_price
  )
  select
    target_org,
    p_order_id,
    nullif(item->>'serviceId', '')::uuid,
    left(trim(item->>'name'), 500),
    1,
    greatest(coalesce((item->>'price')::numeric, 0), 0)
  from jsonb_array_elements(p_services) item;
end;
$$;

revoke all on function public.update_scheduled_work_order(uuid,text,text,text,text,timestamptz,timestamptz,text,jsonb) from public;
grant execute on function public.update_scheduled_work_order(uuid,text,text,text,text,timestamptz,timestamptz,text,jsonb) to authenticated;

