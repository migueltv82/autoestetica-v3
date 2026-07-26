-- Promueve un cliente ocasional y garantiza una tarjeta para el vehículo del turno.
-- Reutiliza tarjetas históricas sin vehicle_id para no perder progreso.
create or replace function public.promote_order_client_with_fidelity(p_order_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
  target_client uuid;
  target_vehicle uuid;
  target_card uuid;
begin
  if target_org is null then raise exception 'Sesión sin organización'; end if;

  select client_id, vehicle_id into target_client, target_vehicle
  from public.work_orders
  where id = p_order_id and organization_id = target_org and deleted_at is null;

  if target_client is null or target_vehicle is null then
    raise exception 'El turno no tiene cliente y vehículo válidos';
  end if;

  update public.clients
  set directory_visible = true
  where id = target_client and organization_id = target_org and deleted_at is null;

  select id into target_card
  from public.fidelity_cards
  where client_id = target_client and vehicle_id = target_vehicle
    and status in ('active', 'reward_ready')
  order by updated_at desc limit 1;

  if target_card is null then
    select id into target_card
    from public.fidelity_cards
    where client_id = target_client and vehicle_id is null
      and status in ('active', 'reward_ready')
    order by updated_at desc limit 1
    for update;

    if target_card is not null then
      update public.fidelity_cards
      set vehicle_id = target_vehicle, updated_at = now()
      where id = target_card;
    else
      insert into public.fidelity_cards(client_id, vehicle_id, stamps_count, total_stamps, status, reward_description)
      values(target_client, target_vehicle, 0, 4, 'active', '5° Lavado Premium Gratis')
      returning id into target_card;
    end if;
  end if;

  return target_card;
end $$;

revoke all on function public.promote_order_client_with_fidelity(uuid) from public;
grant execute on function public.promote_order_client_with_fidelity(uuid) to authenticated;
