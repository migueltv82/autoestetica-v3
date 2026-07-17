-- Impide modificar roles/perfiles directamente desde el cliente.
-- Las futuras altas o cambios de rol deben realizarse mediante funciones controladas.
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;

drop policy if exists tenant_access on public.profiles;
create policy profiles_tenant_read on public.profiles
for select to authenticated
using (organization_id = public.current_organization_id());

-- Historial interno e inalterable de operaciones sensibles.
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  table_name text not null,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  record_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_org_created_idx
on public.audit_logs(organization_id, created_at desc);

alter table public.audit_logs enable row level security;
drop policy if exists audit_logs_tenant_read on public.audit_logs;
create policy audit_logs_tenant_read on public.audit_logs
for select to authenticated
using (organization_id = public.current_organization_id());

revoke insert, update, delete on public.audit_logs from anon, authenticated;
grant select on public.audit_logs to authenticated;

create or replace function public.capture_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_before jsonb;
  row_after jsonb;
  target_org uuid;
  target_id text;
begin
  row_before := case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end;
  row_after := case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end;
  target_org := coalesce((row_after->>'organization_id')::uuid, (row_before->>'organization_id')::uuid);
  target_id := coalesce(row_after->>'id', row_before->>'id', row_after->>'organization_id', row_before->>'organization_id');

  if target_org is not null then
    insert into public.audit_logs(
      organization_id, actor_id, table_name, action, record_id, old_data, new_data
    ) values (
      target_org, auth.uid(), tg_table_name, tg_op, target_id, row_before, row_after
    );
  end if;

  return coalesce(new, old);
end;
$$;

do $$
declare audited_table text;
begin
  foreach audited_table in array array[
    'work_orders', 'work_order_items', 'payments', 'cash_movements',
    'receipts', 'business_settings'
  ] loop
    execute format('drop trigger if exists capture_audit_log on public.%I', audited_table);
    execute format(
      'create trigger capture_audit_log after insert or update or delete on public.%I for each row execute function public.capture_audit_log()',
      audited_table
    );
  end loop;
end;
$$;

revoke all on function public.capture_audit_log() from public;

