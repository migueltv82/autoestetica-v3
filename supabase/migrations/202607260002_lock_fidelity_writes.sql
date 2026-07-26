-- [SEGURIDAD] Fidelización: lectura por miembros y toda escritura mediante RPC controladas.

drop policy if exists fidelity_cards_read on public.fidelity_cards;
drop policy if exists fidelity_cards_write on public.fidelity_cards;
drop policy if exists fidelity_stamps_read on public.fidelity_stamps;
drop policy if exists fidelity_stamps_write on public.fidelity_stamps;

create policy fidelity_cards_member_read on public.fidelity_cards
for select to authenticated
using (
  public.current_user_has_role(array['owner','admin','employee'])
  and exists (
    select 1 from public.clients c
    where c.id = fidelity_cards.client_id
      and c.organization_id = public.current_organization_id()
  )
);

create policy fidelity_stamps_member_read on public.fidelity_stamps
for select to authenticated
using (
  public.current_user_has_role(array['owner','admin','employee'])
  and exists (
    select 1
    from public.fidelity_cards fc
    join public.clients c on c.id = fc.client_id
    where fc.id = fidelity_stamps.fidelity_card_id
      and c.organization_id = public.current_organization_id()
  )
);

create or replace function public.ensure_fidelity_card(p_client_id uuid, p_vehicle_id uuid)
returns public.fidelity_cards
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
  result public.fidelity_cards;
begin
  if target_org is null or not public.current_user_has_role(array['owner','admin']) then
    raise exception 'No tenés permiso para crear tarjetas' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.clients
    where id = p_client_id and organization_id = target_org and deleted_at is null
  ) then raise exception 'Cliente no encontrado'; end if;
  if p_vehicle_id is null or not exists (
    select 1 from public.vehicles
    where id = p_vehicle_id and client_id = p_client_id
      and organization_id = target_org and deleted_at is null
  ) then raise exception 'Vehículo no encontrado'; end if;

  perform 1 from public.vehicles where id = p_vehicle_id for update;
  select * into result from public.fidelity_cards
  where client_id = p_client_id and vehicle_id = p_vehicle_id
    and status in ('active','reward_ready')
  order by updated_at desc limit 1;

  if result.id is null then
    insert into public.fidelity_cards(client_id,vehicle_id,stamps_count,total_stamps,status,reward_description)
    values(p_client_id,p_vehicle_id,0,4,'active','5° Lavado Premium Gratis')
    returning * into result;
  end if;
  return result;
end $$;

create or replace function public.redeem_fidelity_reward(p_card_id uuid)
returns public.fidelity_cards
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
  current_card public.fidelity_cards;
  next_card public.fidelity_cards;
begin
  if target_org is null or not public.current_user_has_role(array['owner','admin']) then
    raise exception 'No tenés permiso para canjear premios' using errcode = '42501';
  end if;

  select fc.* into current_card
  from public.fidelity_cards fc
  join public.clients c on c.id = fc.client_id
  where fc.id = p_card_id and c.organization_id = target_org
  for update of fc;
  if current_card.id is null then raise exception 'Tarjeta no encontrada'; end if;
  if current_card.status <> 'reward_ready' or current_card.stamps_count < current_card.total_stamps then
    raise exception 'La tarjeta todavía no tiene un premio disponible';
  end if;

  update public.fidelity_cards
  set status = 'redeemed',
      total_rewards_redeemed = current_card.total_rewards_redeemed + 1,
      updated_at = now()
  where id = current_card.id;

  insert into public.fidelity_cards(
    client_id,vehicle_id,stamps_count,total_stamps,status,reward_description,total_rewards_redeemed
  ) values (
    current_card.client_id,current_card.vehicle_id,0,current_card.total_stamps,'active',
    current_card.reward_description,current_card.total_rewards_redeemed + 1
  ) returning * into next_card;
  return next_card;
end $$;

-- Estas funciones existentes también cambian estado y deben respetar la matriz de roles.
create or replace function public.set_order_client_directory_visibility(p_order_id uuid,p_visible boolean)
returns void language plpgsql security definer set search_path = public as $$
declare target_org uuid := public.current_organization_id(); target_client uuid;
begin
  if target_org is null or not public.current_user_has_role(array['owner','admin']) then
    raise exception 'No tenés permiso para modificar clientes' using errcode = '42501';
  end if;
  select client_id into target_client from public.work_orders
  where id=p_order_id and organization_id=target_org and deleted_at is null;
  if target_client is null then raise exception 'Turno no encontrado'; end if;
  update public.clients set directory_visible=coalesce(p_visible,true)
  where id=target_client and organization_id=target_org and deleted_at is null;
end $$;

create or replace function public.promote_order_client_with_fidelity(p_order_id uuid,p_generate_card boolean default false)
returns uuid language plpgsql security definer set search_path = public as $$
declare target_org uuid:=public.current_organization_id(); target_client uuid; target_vehicle uuid; target_card uuid;
begin
  if target_org is null or not public.current_user_has_role(array['owner','admin']) then
    raise exception 'No tenés permiso para modificar clientes' using errcode = '42501';
  end if;
  select client_id,vehicle_id into target_client,target_vehicle from public.work_orders
  where id=p_order_id and organization_id=target_org and deleted_at is null;
  if target_client is null or target_vehicle is null then raise exception 'El turno no tiene cliente y vehículo válidos'; end if;
  update public.clients set directory_visible=true where id=target_client and organization_id=target_org and deleted_at is null;
  if not coalesce(p_generate_card,false) then return null; end if;
  select id into target_card from public.ensure_fidelity_card(target_client,target_vehicle);
  return target_card;
end $$;

revoke all on function public.ensure_fidelity_card(uuid,uuid) from public;
revoke all on function public.redeem_fidelity_reward(uuid) from public;
grant execute on function public.ensure_fidelity_card(uuid,uuid) to authenticated;
grant execute on function public.redeem_fidelity_reward(uuid) to authenticated;
