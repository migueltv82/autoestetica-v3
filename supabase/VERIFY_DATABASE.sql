-- Auditoria de solo lectura. Cada consulta debe devolver cero filas o una fila con valor 0.

select 'turnos con cliente de otro negocio' as control, count(*) as problemas
from public.work_orders wo join public.clients c on c.id=wo.client_id
where wo.organization_id<>c.organization_id
union all
select 'turnos con vehiculo de otro negocio', count(*)
from public.work_orders wo join public.vehicles v on v.id=wo.vehicle_id
where wo.organization_id<>v.organization_id
union all
select 'turnos con vehiculo de otro cliente', count(*)
from public.work_orders wo join public.vehicles v on v.id=wo.vehicle_id
where wo.client_id<>v.client_id
union all
select 'items de otro negocio', count(*)
from public.work_order_items i join public.work_orders wo on wo.id=i.work_order_id
where i.organization_id<>wo.organization_id
union all
select 'movimientos de otro negocio', count(*)
from public.cash_movements cm join public.work_orders wo on wo.id=cm.work_order_id
where cm.work_order_id is not null and cm.organization_id<>wo.organization_id
union all
select 'pagos de otro negocio', count(*)
from public.payments p join public.work_orders wo on wo.id=p.work_order_id
where p.work_order_id is not null and p.organization_id<>wo.organization_id
union all
select 'recibos de otro negocio', count(*)
from public.receipts r join public.work_orders wo on wo.id=r.work_order_id
where r.work_order_id is not null and r.organization_id<>wo.organization_id;

select id,name,base_price,car_price,truck_price,price_on_request,
       display->>'carPrice' as json_car_price,
       display->>'truckPrice' as json_truck_price,
       display->>'priceOnRequest' as json_on_request
from public.services where deleted_at is null order by name;

select schemaname,tablename,policyname,roles,cmd
from pg_policies where schemaname in ('public','storage')
order by schemaname,tablename,policyname;
