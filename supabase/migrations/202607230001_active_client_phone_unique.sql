-- Los clientes se eliminan de forma logica. Un registro eliminado no debe
-- impedir que el mismo telefono vuelva a registrarse como cliente activo.
alter table public.clients
  drop constraint if exists clients_organization_id_phone_key;

create unique index if not exists clients_org_active_phone_unique
  on public.clients (organization_id, phone)
  where deleted_at is null;
