-- Permite que un owner cree/vincule otro owner desde el flujo seguro de equipo.
-- Admin sigue pudiendo agregar solamente empleados.

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

  if member_role not in ('owner','admin','employee') then
    raise exception 'Rol invalido';
  end if;

  if member_role in ('owner','admin') and actor_role <> 'owner' then
    raise exception 'Solo un owner puede agregar owners o administradores' using errcode = '42501';
  end if;

  select u.id into target_user
  from auth.users u
  where lower(u.email) = member_email
  limit 1;

  if target_user is null then
    raise exception 'No encontramos un usuario con ese email. Primero debe existir en Supabase Auth.';
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

revoke all on function public.add_existing_user_to_team(text,text,text) from public;
grant execute on function public.add_existing_user_to_team(text,text,text) to authenticated;
