-- Matriz final de roles para Autoestetica Tucuman.
-- owner: acceso total, incluido ajustes, plan y equipo.
-- admin: operacion completa del negocio, sin ajustes, plan ni equipo.
-- employee: solo lectura de agenda y clientes.

drop policy if exists owner_admin_update on public.organizations;
drop policy if exists owner_update on public.organizations;
create policy owner_update on public.organizations
for update to authenticated
using (id = public.current_organization_id() and public.current_user_has_role(array['owner']))
with check (id = public.current_organization_id() and public.current_user_has_role(array['owner']));

drop policy if exists member_read on public.profiles;
drop policy if exists profiles_tenant_read on public.profiles;
drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_owner_read on public.profiles;

create policy profiles_self_read on public.profiles
for select to authenticated
using (id = auth.uid() and organization_id = public.current_organization_id());

create policy profiles_owner_read on public.profiles
for select to authenticated
using (organization_id = public.current_organization_id() and public.current_user_has_role(array['owner']));

do $$
declare
  table_name text;
begin
  foreach table_name in array array['clients', 'vehicles', 'work_photos'] loop
    execute format('drop policy if exists active_member_insert on public.%I', table_name);
    execute format('drop policy if exists active_member_update on public.%I', table_name);
    execute format('drop policy if exists active_member_delete on public.%I', table_name);
    execute format('drop policy if exists owner_admin_insert on public.%I', table_name);
    execute format('drop policy if exists owner_admin_update on public.%I', table_name);
    execute format('drop policy if exists owner_admin_delete on public.%I', table_name);

    execute format(
      'create policy owner_admin_insert on public.%I for insert to authenticated with check (organization_id = public.current_organization_id() and public.current_user_has_role(array[''owner'',''admin'']))',
      table_name
    );
    execute format(
      'create policy owner_admin_update on public.%I for update to authenticated using (organization_id = public.current_organization_id() and public.current_user_has_role(array[''owner'',''admin''])) with check (organization_id = public.current_organization_id() and public.current_user_has_role(array[''owner'',''admin'']))',
      table_name
    );
    execute format(
      'create policy owner_admin_delete on public.%I for delete to authenticated using (organization_id = public.current_organization_id() and public.current_user_has_role(array[''owner'',''admin'']))',
      table_name
    );
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['business_settings', 'schedule_blocks'] loop
    execute format('drop policy if exists owner_admin_insert on public.%I', table_name);
    execute format('drop policy if exists owner_admin_update on public.%I', table_name);
    execute format('drop policy if exists owner_admin_delete on public.%I', table_name);
    execute format('drop policy if exists owner_insert on public.%I', table_name);
    execute format('drop policy if exists owner_update on public.%I', table_name);
    execute format('drop policy if exists owner_delete on public.%I', table_name);

    execute format(
      'create policy owner_insert on public.%I for insert to authenticated with check (organization_id = public.current_organization_id() and public.current_user_has_role(array[''owner'']))',
      table_name
    );
    execute format(
      'create policy owner_update on public.%I for update to authenticated using (organization_id = public.current_organization_id() and public.current_user_has_role(array[''owner''])) with check (organization_id = public.current_organization_id() and public.current_user_has_role(array[''owner'']))',
      table_name
    );
    execute format(
      'create policy owner_delete on public.%I for delete to authenticated using (organization_id = public.current_organization_id() and public.current_user_has_role(array[''owner'']))',
      table_name
    );
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['organization_subscriptions', 'audit_logs'] loop
    execute format('drop policy if exists owner_admin_read on public.%I', table_name);
    execute format('drop policy if exists owner_read on public.%I', table_name);
    execute format(
      'create policy owner_read on public.%I for select to authenticated using (organization_id = public.current_organization_id() and public.current_user_has_role(array[''owner'']))',
      table_name
    );
  end loop;
end $$;

drop policy if exists work_photos_access on storage.objects;
drop policy if exists work_photos_read on storage.objects;
drop policy if exists work_photos_insert on storage.objects;
drop policy if exists work_photos_update on storage.objects;
drop policy if exists work_photos_delete on storage.objects;

create policy work_photos_read on storage.objects
for select to authenticated
using (
  bucket_id = 'work-photos'
  and (storage.foldername(name))[1] = public.current_organization_id()::text
  and public.current_user_has_role(array['owner','admin','employee'])
);

create policy work_photos_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'work-photos'
  and (storage.foldername(name))[1] = public.current_organization_id()::text
  and public.current_user_has_role(array['owner','admin'])
);

create policy work_photos_update on storage.objects
for update to authenticated
using (
  bucket_id = 'work-photos'
  and (storage.foldername(name))[1] = public.current_organization_id()::text
  and public.current_user_has_role(array['owner','admin'])
)
with check (
  bucket_id = 'work-photos'
  and (storage.foldername(name))[1] = public.current_organization_id()::text
  and public.current_user_has_role(array['owner','admin'])
);

create policy work_photos_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'work-photos'
  and (storage.foldername(name))[1] = public.current_organization_id()::text
  and public.current_user_has_role(array['owner','admin'])
);

create or replace function public.set_work_order_status(
  p_order_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
begin
  if target_org is null then
    raise exception 'Sesion sin organizacion' using errcode = '42501';
  end if;

  if not public.current_user_has_role(array['owner','admin']) then
    raise exception 'No tenes permiso para cambiar el estado del turno' using errcode = '42501';
  end if;

  if p_status not in ('inquiry','pending','deposit_pending','confirmed','in_progress','ready','delivered','cancelled','no_show') then
    raise exception 'Estado de turno no valido';
  end if;

  update public.work_orders
  set status = p_status
  where id = p_order_id
    and organization_id = target_org
    and deleted_at is null;

  if not found then
    raise exception 'Turno inexistente';
  end if;
end;
$$;

revoke all on function public.set_work_order_status(uuid,text) from public;
grant execute on function public.set_work_order_status(uuid,text) to authenticated;

create or replace function public.current_usage()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
begin
  if target_org is null then
    raise exception 'Sesion sin organizacion' using errcode = '42501';
  end if;

  if not public.current_user_has_role(array['owner']) then
    raise exception 'No tenes permiso para consultar metricas del plan' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'users', (
      select count(*) from public.profiles
      where organization_id = target_org and active = true and removed_at is null
    ),
    'clients', (
      select count(*) from public.clients
      where organization_id = target_org and deleted_at is null
    ),
    'monthlyOrders', (
      select count(*) from public.work_orders
      where organization_id = target_org
        and deleted_at is null
        and created_at >= date_trunc('month', now())
    )
  );
end;
$$;

revoke all on function public.current_usage() from public;
grant execute on function public.current_usage() to authenticated;

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
  if target_org is null then raise exception 'Sesion sin organizacion' using errcode = '42501'; end if;
  if not public.current_user_has_role(array['owner','admin']) then
    raise exception 'No tenes permiso para crear turnos' using errcode = '42501';
  end if;
  if nullif(trim(p_client_name), '') is null then raise exception 'El cliente es obligatorio'; end if;
  if nullif(trim(p_phone), '') is null then raise exception 'El WhatsApp es obligatorio'; end if;
  if p_scheduled_start is null or p_scheduled_end is null or p_scheduled_end <= p_scheduled_start then
    raise exception 'El horario del turno no es valido';
  end if;
  if jsonb_typeof(p_services) <> 'array' or jsonb_array_length(p_services) = 0 then
    raise exception 'Selecciona al menos un servicio';
  end if;
  if p_status not in ('inquiry','pending','deposit_pending','confirmed','in_progress','ready','delivered','cancelled','no_show') then
    raise exception 'Estado de turno no valido';
  end if;

  if exists (
    select 1 from public.schedule_blocks
    where organization_id = target_org
      and starts_at < p_scheduled_end and ends_at > p_scheduled_start
  ) then raise exception 'Ese horario esta bloqueado'; end if;

  if exists (
    select 1 from public.work_orders
    where organization_id = target_org and deleted_at is null
      and status not in ('cancelled','no_show')
      and scheduled_start < p_scheduled_end and scheduled_end > p_scheduled_start
  ) then raise exception 'Ese horario ya esta ocupado'; end if;

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
      trim(p_client_name) || ' - Turno #' || (select number from public.work_orders where id = order_record),
      order_total, p_cash_method, auth.uid()
    );
  end if;

  perform public.create_receipt_for_order(order_record);
  return order_record;
end;
$$;

revoke all on function public.create_scheduled_work_order(text,text,text,text,timestamptz,timestamptz,text,jsonb,boolean,text,text) from public;
grant execute on function public.create_scheduled_work_order(text,text,text,text,timestamptz,timestamptz,text,jsonb,boolean,text,text) to authenticated;

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
  if target_org is null then raise exception 'Sesion sin organizacion' using errcode = '42501'; end if;
  if not public.current_user_has_role(array['owner','admin']) then
    raise exception 'No tenes permiso para modificar turnos' using errcode = '42501';
  end if;

  select * into order_row
  from public.work_orders
  where id = p_order_id and organization_id = target_org and deleted_at is null
  for update;

  if order_row.id is null then raise exception 'Turno inexistente'; end if;
  if nullif(trim(p_client_name), '') is null then raise exception 'El cliente es obligatorio'; end if;
  if nullif(trim(p_phone), '') is null then raise exception 'El WhatsApp es obligatorio'; end if;
  if p_scheduled_start is null or p_scheduled_end is null or p_scheduled_end <= p_scheduled_start then
    raise exception 'El horario del turno no es valido';
  end if;
  if jsonb_typeof(p_services) <> 'array' or jsonb_array_length(p_services) = 0 then
    raise exception 'Selecciona al menos un servicio';
  end if;
  if p_status not in ('inquiry','pending','deposit_pending','confirmed','in_progress','ready','delivered','cancelled','no_show') then
    raise exception 'Estado de turno no valido';
  end if;

  if exists (
    select 1 from public.schedule_blocks
    where organization_id = target_org
      and starts_at < p_scheduled_end and ends_at > p_scheduled_start
  ) then raise exception 'Ese horario esta bloqueado'; end if;

  if exists (
    select 1 from public.work_orders
    where organization_id = target_org and deleted_at is null and id <> p_order_id
      and status not in ('cancelled','no_show')
      and scheduled_start < p_scheduled_end and scheduled_end > p_scheduled_start
  ) then raise exception 'Ese horario ya esta ocupado'; end if;

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

create or replace function public.create_receipt_for_order(target_order uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.work_orders%rowtype;
  new_receipt uuid;
  paid_total numeric;
begin
  if not public.current_user_has_role(array['owner','admin']) then
    raise exception 'No tenes permiso para generar recibos' using errcode = '42501';
  end if;

  select * into order_row
  from public.work_orders
  where id = target_order
    and organization_id = public.current_organization_id()
    and deleted_at is null;

  if order_row.id is null then raise exception 'Turno inexistente'; end if;

  select id into new_receipt
  from public.receipts
  where work_order_id = target_order and status <> 'voided'
  limit 1;

  if new_receipt is not null then return new_receipt; end if;

  select coalesce(sum(case when kind = 'refund' then -amount else amount end), 0)
  into paid_total
  from public.payments
  where work_order_id = target_order and voided_at is null;

  insert into public.receipts(organization_id, work_order_id, client_id, total, payment_status, created_by)
  values(
    order_row.organization_id,
    order_row.id,
    order_row.client_id,
    order_row.total,
    case
      when paid_total >= order_row.total and order_row.total > 0 then 'paid'
      when paid_total > 0 then 'partial'
      else 'pending'
    end,
    auth.uid()
  )
  returning id into new_receipt;

  insert into public.receipt_items(organization_id, receipt_id, description, quantity, unit_price)
  select organization_id, new_receipt, description, quantity, unit_price
  from public.work_order_items
  where work_order_id = target_order;

  return new_receipt;
end;
$$;

revoke all on function public.create_receipt_for_order(uuid) from public;
grant execute on function public.create_receipt_for_order(uuid) to authenticated;

create or replace function public.list_team_members()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  active boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
begin
  if target_org is null then
    raise exception 'Sesion sin organizacion' using errcode = '42501';
  end if;

  if not public.current_user_has_role(array['owner']) then
    raise exception 'No tenes permiso para ver el equipo' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    u.email::text,
    p.full_name,
    p.role,
    p.active,
    p.created_at,
    u.last_sign_in_at
  from public.profiles p
  left join auth.users u on u.id = p.id
  where p.organization_id = target_org
    and p.removed_at is null
  order by
    case p.role when 'owner' then 1 when 'admin' then 2 else 3 end,
    p.created_at asc;
end;
$$;

revoke all on function public.list_team_members() from public;
grant execute on function public.list_team_members() to authenticated;

create or replace function public.add_existing_user_to_team(
  member_email text,
  member_full_name text,
  member_role text default 'employee'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
  actor_role text := public.current_profile_role();
  target_user uuid;
  existing_org uuid;
  existing_role text;
  active_owner_count integer;
begin
  if target_org is null then
    raise exception 'Sesion sin organizacion' using errcode = '42501';
  end if;

  if actor_role <> 'owner' then
    raise exception 'No tenes permiso para agregar usuarios' using errcode = '42501';
  end if;

  member_email := lower(trim(member_email));
  member_full_name := nullif(trim(member_full_name), '');
  member_role := lower(trim(member_role));

  if member_email is null or member_email = '' then
    raise exception 'El email es obligatorio';
  end if;

  if member_role not in ('owner','admin','employee') then
    raise exception 'Rol invalido';
  end if;

  select u.id into target_user
  from auth.users u
  where lower(u.email) = member_email
  limit 1;

  if target_user is null then
    raise exception 'No encontramos un usuario con ese email. Primero debe existir en Supabase Auth.';
  end if;

  select p.organization_id, p.role into existing_org, existing_role
  from public.profiles p
  where p.id = target_user;

  if existing_org is not null and existing_org <> target_org then
    raise exception 'Ese usuario ya pertenece a otro negocio';
  end if;

  if target_user = auth.uid() and existing_role is not null and member_role <> existing_role then
    raise exception 'No podes cambiar tu propio rol desde este flujo' using errcode = '42501';
  end if;

  if existing_org = target_org and existing_role = 'owner' and member_role <> 'owner' then
    select count(*) into active_owner_count
    from public.profiles
    where organization_id = target_org
      and role = 'owner'
      and active = true
      and removed_at is null;

    if active_owner_count <= 1 then
      raise exception 'El negocio debe conservar al menos un owner activo';
    end if;
  end if;

  insert into public.profiles(id, organization_id, full_name, role, active)
  values(target_user, target_org, member_full_name, member_role, true)
  on conflict (id) do update
  set full_name = excluded.full_name,
      role = excluded.role,
      active = true,
      removed_at = null,
      removed_by = null,
      removal_reason = null
  where public.profiles.organization_id = target_org;

  return target_user;
end;
$$;

revoke all on function public.add_existing_user_to_team(text,text,text) from public;
grant execute on function public.add_existing_user_to_team(text,text,text) to authenticated;

create or replace function public.update_team_member(
  member_id uuid,
  member_full_name text,
  member_role text,
  member_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
  actor_role text := public.current_profile_role();
  current_member public.profiles%rowtype;
  active_owner_count integer;
begin
  if target_org is null then
    raise exception 'Sesion sin organizacion' using errcode = '42501';
  end if;

  if actor_role <> 'owner' then
    raise exception 'No tenes permiso para modificar usuarios' using errcode = '42501';
  end if;

  member_role := lower(trim(member_role));

  if member_role not in ('owner','admin','employee') then
    raise exception 'Rol invalido';
  end if;

  select * into current_member
  from public.profiles
  where id = member_id
    and organization_id = target_org
    and removed_at is null
  for update;

  if current_member.id is null then
    raise exception 'Usuario inexistente';
  end if;

  if member_id = auth.uid() and (member_active = false or member_role <> current_member.role) then
    raise exception 'No podes cambiar tu propio rol ni bloquear tu usuario' using errcode = '42501';
  end if;

  select count(*) into active_owner_count
  from public.profiles
  where organization_id = target_org
    and role = 'owner'
    and active = true
    and removed_at is null;

  if current_member.role = 'owner'
    and active_owner_count <= 1
    and (member_active = false or member_role <> 'owner') then
    raise exception 'El negocio debe conservar al menos un owner activo';
  end if;

  update public.profiles
  set full_name = nullif(trim(member_full_name), ''),
      role = member_role,
      active = member_active
  where id = member_id and organization_id = target_org;
end;
$$;

revoke all on function public.update_team_member(uuid,text,text,boolean) from public;
grant execute on function public.update_team_member(uuid,text,text,boolean) to authenticated;
