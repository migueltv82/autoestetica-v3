-- Bloqueo y eliminacion segura de miembros del equipo.
-- El borrado visible usa removed_at para no romper referencias historicas.

alter table public.profiles
add column if not exists removed_at timestamptz,
add column if not exists removed_by uuid references auth.users(id) on delete set null,
add column if not exists removal_reason text;

create or replace function public.list_team_members()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  active boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
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

  if not public.current_user_has_role(array['owner','admin']) then
    raise exception 'No tenes permiso para ver el equipo' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    u.email::text,
    p.full_name,
    p.role,
    p.active,
    p.created_at,
    u.last_sign_in_at
  from public.profiles p
  left join auth.users u on u.id = p.id
  where p.organization_id = target_org
    and p.removed_at is null
  order by
    case p.role when 'owner' then 1 when 'admin' then 2 else 3 end,
    p.created_at asc;
end;
$$;

create or replace function public.update_team_member(
  member_id uuid,
  member_full_name text,
  member_role text,
  member_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
  actor_role text := public.current_profile_role();
  current_member public.profiles%rowtype;
  active_owner_count integer;
begin
  if target_org is null then
    raise exception 'Sesion sin organizacion' using errcode = '42501';
  end if;

  if actor_role not in ('owner','admin') then
    raise exception 'No tenes permiso para modificar usuarios' using errcode = '42501';
  end if;

  member_role := lower(trim(member_role));

  if member_role not in ('owner','admin','employee') then
    raise exception 'Rol invalido';
  end if;

  select * into current_member
  from public.profiles
  where id = member_id
    and organization_id = target_org
    and removed_at is null
  for update;

  if current_member.id is null then
    raise exception 'Usuario inexistente';
  end if;

  if member_id = auth.uid() and (member_active = false or member_role <> current_member.role) then
    raise exception 'No podes cambiar tu propio rol ni bloquear tu usuario' using errcode = '42501';
  end if;

  if actor_role <> 'owner' and (
    current_member.role in ('owner','admin') or member_role in ('owner','admin')
  ) then
    raise exception 'Solo un owner puede modificar owners o administradores' using errcode = '42501';
  end if;

  select count(*) into active_owner_count
  from public.profiles
  where organization_id = target_org
    and role = 'owner'
    and active = true
    and removed_at is null;

  if current_member.role = 'owner'
    and active_owner_count <= 1
    and (member_active = false or member_role <> 'owner') then
    raise exception 'El negocio debe conservar al menos un owner activo';
  end if;

  update public.profiles
  set full_name = nullif(trim(member_full_name), ''),
      role = member_role,
      active = member_active
  where id = member_id and organization_id = target_org;
end;
$$;

revoke all on function public.list_team_members() from public;
revoke all on function public.update_team_member(uuid,text,text,boolean) from public;

grant execute on function public.list_team_members() to authenticated;
grant execute on function public.update_team_member(uuid,text,text,boolean) to authenticated;
