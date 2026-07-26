create or replace function public.void_work_order(target_order uuid) returns void language plpgsql security definer set search_path=public as $$
declare target_org uuid:=public.current_organization_id();
begin
 if target_org is null then raise exception 'Sesión sin organización'; end if;
 if not public.current_user_has_role(array['owner','admin']) then raise exception 'No tenés permiso para eliminar turnos' using errcode='42501'; end if;
 if not exists(select 1 from public.work_orders where id=target_order and organization_id=target_org and deleted_at is null) then raise exception 'Turno inexistente o ya eliminado'; end if;
 update public.cash_movements set work_order_id=null where organization_id=target_org and work_order_id=target_order;
 update public.payments set work_order_id=null where organization_id=target_org and work_order_id=target_order;
 update public.receipts set work_order_id=null where organization_id=target_org and work_order_id=target_order;
 delete from public.work_orders where id=target_order and organization_id=target_org;
end $$;

create or replace function public.delete_client_completely(p_client_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare target_org uuid:=public.current_organization_id();
begin
 if target_org is null then raise exception 'Sesión sin organización'; end if;
 if not public.current_user_has_role(array['owner','admin']) then raise exception 'No tenés permiso para eliminar clientes' using errcode='42501'; end if;
 if not exists(select 1 from public.clients where id=p_client_id and organization_id=target_org) then raise exception 'Cliente inexistente'; end if;
 update public.cash_movements cm set payment_id=null,work_order_id=null where cm.organization_id=target_org and (cm.payment_id in(select p.id from public.payments p where p.client_id=p_client_id) or cm.work_order_id in(select wo.id from public.work_orders wo where wo.client_id=p_client_id));
 delete from public.receipts where organization_id=target_org and client_id=p_client_id;
 delete from public.payments where organization_id=target_org and client_id=p_client_id;
 delete from public.work_orders where organization_id=target_org and client_id=p_client_id;
 delete from public.fidelity_cards where client_id=p_client_id;
 delete from public.vehicles where organization_id=target_org and client_id=p_client_id;
 delete from public.clients where organization_id=target_org and id=p_client_id;
end $$;
revoke all on function public.delete_client_completely(uuid) from public;
grant execute on function public.delete_client_completely(uuid) to authenticated;

drop function if exists public.promote_order_client_with_fidelity(uuid);
create function public.promote_order_client_with_fidelity(p_order_id uuid,p_generate_card boolean default false) returns uuid language plpgsql security definer set search_path=public as $$
declare target_org uuid:=public.current_organization_id(); target_client uuid; target_vehicle uuid; target_card uuid;
begin
 if target_org is null then raise exception 'Sesión sin organización'; end if;
 select client_id,vehicle_id into target_client,target_vehicle from public.work_orders where id=p_order_id and organization_id=target_org and deleted_at is null;
 if target_client is null or target_vehicle is null then raise exception 'El turno no tiene cliente y vehículo válidos'; end if;
 update public.clients set directory_visible=true where id=target_client and organization_id=target_org and deleted_at is null;
 if not coalesce(p_generate_card,false) then return null; end if;
 select id into target_card from public.fidelity_cards where client_id=target_client and vehicle_id=target_vehicle and status in('active','reward_ready') order by updated_at desc limit 1;
 if target_card is null then
  select id into target_card from public.fidelity_cards where client_id=target_client and vehicle_id is null and status in('active','reward_ready') order by updated_at desc limit 1 for update;
  if target_card is not null then update public.fidelity_cards set vehicle_id=target_vehicle,updated_at=now() where id=target_card;
  else insert into public.fidelity_cards(client_id,vehicle_id,stamps_count,total_stamps,status,reward_description) values(target_client,target_vehicle,0,4,'active','5° Lavado Premium Gratis') returning id into target_card;
  end if;
 end if;
 return target_card;
end $$;
revoke all on function public.promote_order_client_with_fidelity(uuid,boolean) from public;
grant execute on function public.promote_order_client_with_fidelity(uuid,boolean) to authenticated;
