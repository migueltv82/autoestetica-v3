-- PELIGRO: elimina los datos y estructuras anteriores de Autoestética.
-- Ejecutar únicamente en el proyecto nuevo o en una base confirmada como descartable.
begin;

drop policy if exists work_photos_access on storage.objects;
delete from storage.objects where bucket_id = 'work-photos';
delete from storage.buckets where id = 'work-photos';

drop table if exists public.receipt_items cascade;
drop table if exists public.receipts cascade;
drop table if exists public.cash_movements cascade;
drop table if exists public.payments cascade;
drop table if exists public.work_photos cascade;
drop table if exists public.work_order_items cascade;
drop table if exists public.work_orders cascade;
drop table if exists public.vehicles cascade;
drop table if exists public.clients cascade;
drop table if exists public.services cascade;
drop table if exists public.business_settings cascade;
drop table if exists public.profiles cascade;
drop table if exists public.organizations cascade;
drop table if exists public.turns cascade;

drop function if exists public.refresh_work_order_subtotal() cascade;
drop function if exists public.touch_updated_at() cascade;
drop function if exists public.current_organization_id() cascade;

commit;
