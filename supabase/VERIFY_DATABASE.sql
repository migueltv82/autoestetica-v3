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

-- Controles esperados despues de aplicar 202607170001_role_based_permissions.sql.
-- Cada fila debe devolver problemas = 0.
select 'politicas tenant_access antiguas' as control, count(*) as problemas
from pg_policies
where schemaname = 'public' and policyname = 'tenant_access'
union all
select 'tablas financieras con lectura operativa', count(*)
from pg_policies
where schemaname = 'public'
  and tablename in ('payments','cash_movements','receipts','receipt_items','cash_closures','organization_subscriptions','audit_logs')
  and policyname = 'member_read'
union all
select 'funciones rpc de permisos faltantes', 16 - count(distinct p.proname)
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'current_profile_role',
    'current_user_has_role',
    'set_work_order_status',
    'current_usage',
    'create_scheduled_work_order',
    'update_scheduled_work_order',
    'void_work_order',
    'create_receipt_for_order',
    'list_team_members',
    'add_existing_user_to_team',
    'update_team_member',
    'record_fidelity_stamp',
    'ensure_fidelity_card',
    'redeem_fidelity_reward',
    'lookup_public_fidelity_card',
    'submit_inquiry'
  )
union all
select 'columnas de baja de perfiles faltantes', 3 - count(*)
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name in ('removed_at','removed_by','removal_reason')
union all
select 'perfiles con lectura amplia de equipo', count(*)
from pg_policies
where schemaname = 'public'
  and tablename = 'profiles'
  and policyname in ('member_read','profiles_tenant_read')
union all
select 'empleado con escritura directa en clientes/vehiculos/fotos', count(*)
from pg_policies
where schemaname = 'public'
  and tablename in ('clients','vehicles','work_photos')
  and policyname in ('active_member_insert','active_member_update','active_member_delete')
union all
select 'ajustes con escritura de admin', count(*)
from pg_policies
where schemaname = 'public'
  and tablename in ('business_settings','schedule_blocks')
  and policyname in ('owner_admin_insert','owner_admin_update','owner_admin_delete')
union all
select 'plan/auditoria visible para admin', count(*)
from pg_policies
where schemaname = 'public'
  and tablename in ('organization_subscriptions','audit_logs')
  and policyname = 'owner_admin_read'
union all
select 'storage work_photos con acceso total antiguo', count(*)
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname = 'work_photos_access'
union all
select 'fidelizacion con escritura directa', count(*)
from pg_policies
where schemaname='public' and tablename in ('fidelity_cards','fidelity_stamps')
  and cmd in ('INSERT','UPDATE','DELETE','ALL')
union all
select 'consulta por telefono antigua expuesta', count(*)
from information_schema.routine_privileges
where specific_schema='public' and routine_name='lookup_fidelity_card_by_phone'
  and grantee in ('anon','authenticated')
union all
select 'tabla anti-spam sin RLS', count(*)
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname='public_inquiry_attempts' and not c.relrowsecurity;
