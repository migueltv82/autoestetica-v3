-- Mantiene el total de cada orden sincronizado con sus servicios.
create or replace function public.refresh_work_order_subtotal(target_order uuid) returns void
language sql security definer set search_path = public as $$
  update public.work_orders
  set subtotal = coalesce((select sum(total) from public.work_order_items where work_order_id = target_order), 0),
      updated_at = now()
  where id = target_order;
$$;

create or replace function public.sync_work_order_subtotal() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.refresh_work_order_subtotal(coalesce(new.work_order_id, old.work_order_id));
  if tg_op = 'UPDATE' and old.work_order_id <> new.work_order_id then
    perform public.refresh_work_order_subtotal(old.work_order_id);
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists sync_work_order_subtotal on public.work_order_items;
create trigger sync_work_order_subtotal after insert or update or delete on public.work_order_items
for each row execute function public.sync_work_order_subtotal();

update public.work_orders orders
set subtotal = coalesce((select sum(items.total) from public.work_order_items items where items.work_order_id = orders.id), 0),
    updated_at = now();

create index if not exists payments_org_order_active_idx
on public.payments (organization_id, work_order_id, paid_at) where voided_at is null;

