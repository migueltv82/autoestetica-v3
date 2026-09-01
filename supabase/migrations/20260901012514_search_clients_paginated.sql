-- Devuelve ids de clientes paginados, con busqueda opcional por nombre,
-- telefono, email o datos del vehiculo (patente, marca, modelo). Reemplaza
-- el patron actual de traer el directorio completo del negocio y filtrar
-- en el navegador. Mismo alcance de lectura que la policy member_read
-- sobre clients/vehicles: cualquier miembro activo del equipo, sin
-- restriccion de rol.
create or replace function public.search_clients(
  p_query text default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (id uuid, total_count bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
  term text := nullif(trim(p_query), '');
begin
  if target_org is null then
    raise exception 'Sesion sin organizacion' using errcode = '42501';
  end if;

  return query
  select c.id, count(*) over() as total_count
  from public.clients c
  where c.organization_id = target_org
    and c.directory_visible = true
    and c.deleted_at is null
    and (
      term is null
      or c.name ilike '%' || term || '%'
      or c.phone ilike '%' || term || '%'
      or c.email ilike '%' || term || '%'
      or exists (
        select 1 from public.vehicles v
        where v.client_id = c.id
          and v.deleted_at is null
          and (
            v.license_plate ilike '%' || term || '%'
            or v.brand ilike '%' || term || '%'
            or v.model ilike '%' || term || '%'
          )
      )
    )
  order by c.created_at desc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
end;
$$;

revoke all on function public.search_clients(text, int, int) from public;
grant execute on function public.search_clients(text, int, int) to authenticated;

-- Soporta el conteo de "clientes frecuentes" (agregado por client_id) sin
-- forzar un sequential scan de work_orders por cada cliente.
create index if not exists work_orders_client_status_idx
  on public.work_orders(client_id, status)
  where deleted_at is null;

-- Estadisticas del directorio (tarjetas de Clientes) calculadas en SQL en
-- vez de sobre el listado completo traido al navegador.
create or replace function public.client_directory_stats()
returns table (total_clients bigint, frequent_clients bigint, new_this_month bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
begin
  if target_org is null then
    raise exception 'Sesion sin organizacion' using errcode = '42501';
  end if;

  return query
  select
    count(*) as total_clients,
    count(*) filter (
      where (
        select count(*) from public.work_orders wo
        where wo.client_id = c.id and wo.status = 'delivered' and wo.deleted_at is null
      ) >= 3
    ) as frequent_clients,
    count(*) filter (where c.created_at >= date_trunc('month', now())) as new_this_month
  from public.clients c
  where c.organization_id = target_org
    and c.directory_visible = true
    and c.deleted_at is null;
end;
$$;

revoke all on function public.client_directory_stats() from public;
grant execute on function public.client_directory_stats() to authenticated;
