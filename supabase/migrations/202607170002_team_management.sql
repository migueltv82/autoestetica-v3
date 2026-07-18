-- Gestion segura del equipo desde el panel.
-- No usa permisos directos sobre profiles: todo pasa por RPC con validaciones.

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
  order by
    case p.role when 'owner' then 1 when 'admin' then 2 else 3 end,
    p.created_at asc;
end;
$$;

create or replace function public.add_existing_user_to_team(
  member_email text,
  member_full_name text,
  member_role text default 'employee'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid := public.current_organization_id();
  actor_role text := public.current_profile_role();
  target_user uuid;
  existing_org uuid;
begin
  if target_org is null then
    raise exception 'Sesion sin organizacion' using errcode = '42501';
  end if;

  if actor_role not in ('owner','admin') then
    raise exception 'No tenes permiso para agregar usuarios' using errcode = '42501';
  end if;

  member_email := lower(trim(member_email));
  member_full_name := nullif(trim(member_full_name), '');
  member_role := lower(trim(member_role));

  if member_email is null or member_email = '' then
    raise exception 'El email es obligatorio';
  end if;

  if member_role not in ('admin','employee') then
    raise exception 'Rol invalido';
  end if;

  if member_role = 'admin' and actor_role <> 'owner' then
    raise exception 'Solo un owner puede agregar administradores' using errcode = '42501';
  end if;

  select u.id into target_user
  from auth.users u
  where lower(u.email) = member_email
  limit 1;

  if target_user is null then
    raise exception 'No encontramos un usuario con ese email. Primero crealo en Supabase Authentication > Users y volve a intentarlo.';
  end if;

  select p.organization_id into existing_org
  from public.profiles p
  where p.id = target_user;

  if existing_org is not null and existing_org <> target_org then
    raise exception 'Ese usuario ya pertenece a otro negocio';
  end if;

  insert into public.profiles(id, organization_id, full_name, role, active)
  values(target_user, target_org, member_full_name, member_role, true)
  on conflict (id) do update
  set full_name = excluded.full_name,
      role = excluded.role,
      active = true
  where public.profiles.organization_id = target_org;

  return target_user;
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
  where id = member_id and organization_id = target_org
  for update;

  if current_member.id is null then
    raise exception 'Usuario inexistente';
  end if;

  if member_id = auth.uid() and (member_active = false or member_role <> current_member.role) then
    raise exception 'No podes cambiar tu propio rol ni desactivar tu usuario' using errcode = '42501';
  end if;

  if actor_role <> 'owner' and (
    current_member.role in ('owner','admin') or member_role in ('owner','admin')
  ) then
    raise exception 'Solo un owner puede modificar owners o administradores' using errcode = '42501';
  end if;

  select count(*) into active_owner_count
  from public.profiles
  where organization_id = target_org and role = 'owner' and active = true;

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

drop trigger if exists capture_audit_log on public.profiles;
create trigger capture_audit_log
after insert or update or delete on public.profiles
for each row execute function public.capture_audit_log();

revoke all on function public.list_team_members() from public;
revoke all on function public.add_existing_user_to_team(text,text,text) from public;
revoke all on function public.update_team_member(uuid,text,text,boolean) from public;

grant execute on function public.list_team_members() to authenticated;
grant execute on function public.add_existing_user_to_team(text,text,text) to authenticated;
grant execute on function public.update_team_member(uuid,text,text,boolean) to authenticated;
