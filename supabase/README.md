# Base de datos nueva de Autoestética

La aplicación usa una sola fuente de verdad en Supabase. `localStorage` será retirado de los módulos operativos.

## Instalación limpia

1. Crear un proyecto nuevo en Supabase y esperar a que figure `Healthy`.
2. Copiar `Project URL` y la clave pública en `.env.local`.
3. Si el proyecto contiene tablas descartables, ejecutar `RESET_DATABASE.sql` en SQL Editor.
4. Ejecutar todos los archivos de `migrations/` en orden por nombre.
5. Crear el usuario propietario en Authentication > Users.
6. Ejecutar el bloque de vinculación incluido abajo.
7. Ejecutar `VERIFY_DATABASE.sql`: todos los controles de integridad deben devolver `0`.
8. Aplicar el procedimiento de respaldo documentado en `BACKUP_AND_RECOVERY.md`.

## Vincular el propietario

Reemplazar el email antes de ejecutar:

```sql
with selected_org as (
  insert into public.organizations (name, slug)
  values ('Autoestética Tucumán', 'autoestetica-tucuman')
  on conflict (slug) do update set name = excluded.name
  returning id
), selected_user as (
  select id from auth.users where lower(email) = lower('TU_EMAIL_REAL')
)
insert into public.profiles (id, organization_id, full_name, role, active)
select selected_user.id, selected_org.id, 'Propietario', 'owner', true
from selected_user cross join selected_org
on conflict (id) do update set organization_id = excluded.organization_id, role = 'owner', active = true;

insert into public.business_settings (organization_id, business_name, address, whatsapp)
select id, 'Autoestética Tucumán', 'Tucumán, Argentina', '+54 9 381 5448147'
from public.organizations where slug = 'autoestetica-tucuman'
on conflict (organization_id) do update set business_name = excluded.business_name;
```

## Modelo

`organización → cliente → vehículos → órdenes de trabajo → servicios/pagos/fotos/recibos`

Nunca guardar una clave `service_role` o `secret` dentro del frontend.
