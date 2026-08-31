-- Mantiene el recibo alineado con el turno cada vez que cambia su total o detalle.
create or replace function public.sync_receipt_from_work_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  receipt_record record;
  paid_total numeric;
begin
  for receipt_record in
    select id
    from public.receipts
    where work_order_id = new.id
      and organization_id = new.organization_id
      and status <> 'voided'
  loop
    select coalesce(sum(case when kind = 'refund' then -amount else amount end), 0)
      into paid_total
    from public.payments
    where work_order_id = new.id
      and organization_id = new.organization_id
      and voided_at is null;

    update public.receipts
    set total = new.total,
        client_id = new.client_id,
        payment_status = case
          when paid_total >= new.total and new.total > 0 then 'paid'
          when paid_total > 0 then 'partial'
          else 'pending'
        end
    where id = receipt_record.id;

    delete from public.receipt_items
    where receipt_id = receipt_record.id
      and organization_id = new.organization_id;

    insert into public.receipt_items (
      organization_id, receipt_id, description, quantity, unit_price
    )
    select organization_id, receipt_record.id, description, quantity, unit_price
    from public.work_order_items
    where work_order_id = new.id
      and organization_id = new.organization_id;
  end loop;

  return new;
end;
$$;

drop trigger if exists sync_receipt_from_work_order on public.work_orders;
create trigger sync_receipt_from_work_order
after update of subtotal, discount, surcharge, client_id on public.work_orders
for each row execute function public.sync_receipt_from_work_order();

revoke all on function public.sync_receipt_from_work_order() from public;

