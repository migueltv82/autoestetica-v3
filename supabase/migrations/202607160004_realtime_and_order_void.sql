-- Elimina definitivamente un turno y toda su información financiera relacionada.
create or replace function public.void_work_order(target_order uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
begin
  if target_org is null then raise exception 'Sesión sin organización'; end if;
  if not exists (select 1 from public.work_orders where id = target_order and organization_id = target_org and deleted_at is null) then
    raise exception 'Turno inexistente o ya eliminado';
  end if;

  delete from public.cash_movements
  where organization_id = target_org and work_order_id = target_order;

  delete from public.receipt_items
  where organization_id = target_org
    and receipt_id in (
      select id from public.receipts
      where organization_id = target_org and work_order_id = target_order
    );

  delete from public.receipts
  where organization_id = target_org and work_order_id = target_order;

  delete from public.payments
  where organization_id = target_org and work_order_id = target_order;

  delete from public.work_order_items
  where organization_id = target_org and work_order_id = target_order;

  delete from public.work_photos
  where organization_id = target_org and work_order_id = target_order;

  delete from public.work_orders
  where id = target_order and organization_id = target_org;
end;
$$;

revoke all on function public.void_work_order(uuid) from public;
grant execute on function public.void_work_order(uuid) to authenticated;

-- Habilita eventos Realtime. El bloque tolera tablas ya agregadas a la publicación.
do $$
declare table_name text;
begin
  foreach table_name in array array['work_orders','work_order_items','payments','cash_movements','receipts','clients','vehicles'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;
