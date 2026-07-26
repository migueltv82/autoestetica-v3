create or replace function public.set_order_client_directory_visibility(
  p_order_id uuid,
  p_visible boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
  target_client uuid;
begin
  if target_org is null then raise exception 'Sesión sin organización'; end if;
  select client_id into target_client
  from public.work_orders
  where id = p_order_id and organization_id = target_org and deleted_at is null;
  if target_client is null then raise exception 'Turno no encontrado'; end if;
  update public.clients
  set directory_visible = coalesce(p_visible, true)
  where id = target_client and organization_id = target_org and deleted_at is null;
end $$;

revoke all on function public.set_order_client_directory_visibility(uuid,boolean) from public;
grant execute on function public.set_order_client_directory_visibility(uuid,boolean) to authenticated;
