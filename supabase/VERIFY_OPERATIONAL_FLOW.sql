-- Ejecutar después de crear y editar un turno de prueba desde la aplicación.
-- Todos los valores de "problemas" deben ser 0.

with active_orders as (
  select wo.id, wo.organization_id, wo.subtotal, wo.discount, wo.surcharge, wo.total
  from public.work_orders wo
  where wo.deleted_at is null
),
item_totals as (
  select work_order_id, coalesce(sum(total), 0) as total
  from public.work_order_items
  group by work_order_id
),
receipt_totals as (
  select r.work_order_id, r.total,
    coalesce(sum(ri.total), 0) as items_total
  from public.receipts r
  left join public.receipt_items ri on ri.receipt_id = r.id
  where r.status <> 'voided'
  group by r.id, r.work_order_id, r.total
)
select 'subtotal del turno distinto a sus servicios' as control, count(*) as problemas
from active_orders wo
left join item_totals items on items.work_order_id = wo.id
where wo.subtotal <> coalesce(items.total, 0)
union all
select 'total del recibo distinto al turno', count(*)
from receipt_totals receipt
join active_orders wo on wo.id = receipt.work_order_id
where receipt.total <> wo.total
union all
select 'detalle del recibo distinto al subtotal del turno', count(*)
from receipt_totals receipt
join active_orders wo on wo.id = receipt.work_order_id
where wo.subtotal <> receipt.items_total
union all
select 'pagos activos sin turno', count(*)
from public.payments payment
left join public.work_orders wo on wo.id = payment.work_order_id
where payment.voided_at is null and payment.work_order_id is not null and wo.id is null
union all
select 'movimientos activos sin turno', count(*)
from public.cash_movements movement
left join public.work_orders wo on wo.id = movement.work_order_id
where movement.voided_at is null and movement.work_order_id is not null and wo.id is null
union all
select 'recibos activos sin turno', count(*)
from public.receipts receipt
left join public.work_orders wo on wo.id = receipt.work_order_id
where receipt.status <> 'voided' and receipt.work_order_id is not null and wo.id is null
union all
select 'troqueles asociados a turnos no finalizados', count(*)
from public.fidelity_stamps stamp
join public.work_orders wo on wo.id = stamp.work_order_id
where wo.status <> 'delivered' or wo.deleted_at is not null
union all
select 'troqueles asociados a otra organizacion', count(*)
from public.fidelity_stamps stamp
join public.fidelity_cards card on card.id = stamp.fidelity_card_id
join public.clients client on client.id = card.client_id
join public.work_orders wo on wo.id = stamp.work_order_id
where client.organization_id <> wo.organization_id;
