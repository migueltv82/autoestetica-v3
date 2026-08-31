alter table public.work_orders
  add column if not exists inquiry_read_at timestamptz;

create index if not exists work_orders_unread_inquiries_idx
  on public.work_orders(organization_id, created_at desc)
  where status = 'inquiry' and inquiry_read_at is null and deleted_at is null;

create or replace function public.mark_inquiry_read(p_order_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare target_org uuid:=public.current_organization_id();
begin
  if target_org is null then raise exception 'Sesion sin organizacion'; end if;
  if not public.current_user_has_role(array['owner','admin','employee']) then
    raise exception 'No tenes permiso para leer consultas' using errcode='42501';
  end if;
  update public.work_orders
  set inquiry_read_at=coalesce(inquiry_read_at,now()),updated_at=now()
  where id=p_order_id and organization_id=target_org and status='inquiry' and deleted_at is null;
  if not found then raise exception 'Consulta no encontrada'; end if;
end $$;
revoke all on function public.mark_inquiry_read(uuid) from public;
grant execute on function public.mark_inquiry_read(uuid) to authenticated;
