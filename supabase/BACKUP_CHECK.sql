-- Guardar este resultado antes y después de migraciones o restauraciones.
select table_name, row_count from (
  select 'organizations' table_name, count(*) row_count from public.organizations union all
  select 'profiles', count(*) from public.profiles union all
  select 'clients', count(*) from public.clients union all
  select 'vehicles', count(*) from public.vehicles union all
  select 'services', count(*) from public.services union all
  select 'work_orders', count(*) from public.work_orders union all
  select 'work_order_items', count(*) from public.work_order_items union all
  select 'payments', count(*) from public.payments union all
  select 'cash_movements', count(*) from public.cash_movements union all
  select 'receipts', count(*) from public.receipts union all
  select 'receipt_items', count(*) from public.receipt_items union all
  select 'audit_logs', count(*) from public.audit_logs union all
  select 'business_settings', count(*) from public.business_settings union all
  select 'schedule_blocks', count(*) from public.schedule_blocks union all
  select 'cash_closures', count(*) from public.cash_closures
  union all select 'fidelity_cards', count(*) from public.fidelity_cards
  union all select 'fidelity_stamps', count(*) from public.fidelity_stamps
  union all select 'public_inquiry_attempts', count(*) from public.public_inquiry_attempts
) counts order by table_name;
