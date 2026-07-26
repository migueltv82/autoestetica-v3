-- [FIDELIZACIÓN] Registra el troquel y actualiza la tarjeta en una sola transacción.
-- La orden queda bloqueada durante la operación y su índice único evita duplicados.
create or replace function public.record_fidelity_stamp(
  p_order_id uuid,
  p_notes text default 'Vehículo entregado'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
  target_order public.work_orders;
  card_record public.fidelity_cards;
  next_stamps integer;
  newly_unlocked boolean := false;
begin
  if target_org is null then
    raise exception 'Sesión sin organización' using errcode = '42501';
  end if;
  if not public.current_user_has_role(array['owner','admin']) then
    raise exception 'No tenés permiso para asignar troqueles' using errcode = '42501';
  end if;

  select wo.* into target_order
  from public.work_orders wo
  where wo.id = p_order_id
    and wo.organization_id = target_org
    and wo.deleted_at is null
  for update;

  if target_order.id is null then
    raise exception 'Turno no encontrado';
  end if;
  if target_order.status <> 'delivered' then
    raise exception 'El troquel solo puede asignarse a un trabajo finalizado';
  end if;

  -- Serializa la creación de la tarjeta para evitar dos tarjetas activas si
  -- dos trabajos del mismo vehículo se finalizan al mismo tiempo.
  if target_order.vehicle_id is not null then
    perform 1 from public.vehicles where id = target_order.vehicle_id for update;
  else
    perform 1 from public.clients where id = target_order.client_id for update;
  end if;

  select fc.* into card_record
  from public.fidelity_stamps fs
  join public.fidelity_cards fc on fc.id = fs.fidelity_card_id
  where fs.work_order_id = p_order_id
  limit 1;

  if card_record.id is not null then
    return jsonb_build_object(
      'card', to_jsonb(card_record),
      'newlyUnlocked', false,
      'alreadyUnlocked', true
    );
  end if;

  select fc.* into card_record
  from public.fidelity_cards fc
  where fc.client_id = target_order.client_id
    and fc.vehicle_id is not distinct from target_order.vehicle_id
    and fc.status in ('active','reward_ready')
  order by fc.updated_at desc
  limit 1
  for update;

  if card_record.id is null then
    insert into public.fidelity_cards (
      client_id, vehicle_id, stamps_count, total_stamps, status, reward_description
    ) values (
      target_order.client_id, target_order.vehicle_id, 0, 4, 'active', '5° Lavado Premium Gratis'
    ) returning * into card_record;
  end if;

  if card_record.status = 'reward_ready' then
    return jsonb_build_object(
      'card', to_jsonb(card_record),
      'newlyUnlocked', false,
      'alreadyUnlocked', true
    );
  end if;

  next_stamps := least(card_record.total_stamps, card_record.stamps_count + 1);
  newly_unlocked := next_stamps >= card_record.total_stamps;

  update public.fidelity_cards
  set stamps_count = next_stamps,
      status = case when newly_unlocked then 'reward_ready' else 'active' end,
      updated_at = now()
  where id = card_record.id
  returning * into card_record;

  insert into public.fidelity_stamps (fidelity_card_id, work_order_id, notes)
  values (card_record.id, p_order_id, nullif(trim(p_notes), ''));

  return jsonb_build_object(
    'card', to_jsonb(card_record),
    'newlyUnlocked', newly_unlocked,
    'alreadyUnlocked', false
  );
end $$;

revoke all on function public.record_fidelity_stamp(uuid,text) from public;
grant execute on function public.record_fidelity_stamp(uuid,text) to authenticated;
