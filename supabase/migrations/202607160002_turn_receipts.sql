create or replace function public.create_receipt_for_order(target_order uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare order_row public.work_orders%rowtype; new_receipt uuid; paid_total numeric;
begin
  select * into order_row from public.work_orders where id=target_order and organization_id=public.current_organization_id() and deleted_at is null;
  if order_row.id is null then raise exception 'Turno inexistente'; end if;
  select id into new_receipt from public.receipts where work_order_id=target_order and status<>'voided' limit 1;
  if new_receipt is not null then return new_receipt; end if;
  select coalesce(sum(case when kind='refund' then -amount else amount end),0) into paid_total from public.payments where work_order_id=target_order and voided_at is null;
  insert into public.receipts(organization_id,work_order_id,client_id,total,payment_status,created_by)
  values(order_row.organization_id,order_row.id,order_row.client_id,order_row.total,case when paid_total>=order_row.total and order_row.total>0 then 'paid' when paid_total>0 then 'partial' else 'pending' end,auth.uid()) returning id into new_receipt;
  insert into public.receipt_items(organization_id,receipt_id,description,quantity,unit_price)
  select organization_id,new_receipt,description,quantity,unit_price from public.work_order_items where work_order_id=target_order;
  return new_receipt;
end $$;
revoke all on function public.create_receipt_for_order(uuid) from public;
grant execute on function public.create_receipt_for_order(uuid) to authenticated;

create or replace function public.sync_receipt_payment_status() returns trigger language plpgsql security definer set search_path=public as $$
declare target_order uuid; order_total numeric; paid_total numeric;
begin
  target_order:=coalesce(new.work_order_id,old.work_order_id);
  if target_order is null then return coalesce(new,old); end if;
  select total into order_total from public.work_orders where id=target_order;
  select coalesce(sum(case when kind='refund' then -amount else amount end),0) into paid_total from public.payments where work_order_id=target_order and voided_at is null;
  update public.receipts set payment_status=case when paid_total>=order_total and order_total>0 then 'paid' when paid_total>0 then 'partial' else 'pending' end where work_order_id=target_order and status<>'voided';
  return coalesce(new,old);
end $$;
drop trigger if exists sync_receipt_payment_status on public.payments;
create trigger sync_receipt_payment_status after insert or update or delete on public.payments for each row execute function public.sync_receipt_payment_status();
