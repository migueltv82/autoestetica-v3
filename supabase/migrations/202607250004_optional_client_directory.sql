-- Permite conservar clientes operativos de un turno sin mostrarlos en el directorio comercial.
alter table public.clients
  add column if not exists directory_visible boolean not null default true;

create index if not exists clients_directory_visible_idx
on public.clients(organization_id, directory_visible)
where deleted_at is null;
