# Base de datos de Autoestética Tucumán

La aplicación usa Supabase como única fuente de verdad. El frontend nunca debe guardar claves `service_role` ni secretos.

## Instalación limpia

1. Crear un proyecto nuevo en Supabase y esperar a que figure `Healthy`.
2. Copiar `Project URL` y la clave pública en `.env.local`.
3. Si el proyecto contiene tablas descartables, ejecutar `RESET_DATABASE.sql` en SQL Editor.
4. Ejecutar todos los archivos de `migrations/` en orden por nombre.
5. Crear el usuario propietario en Authentication > Users.
6. Ejecutar el bloque de vinculación incluido abajo.
7. Ejecutar `VERIFY_DATABASE.sql`: todos los controles de integridad deben devolver `0`.
8. Desplegar las Edge Functions de equipo para poder crear/invitar/eliminar usuarios desde Ajustes > Equipo y permisos.
9. Aplicar el procedimiento de respaldo documentado en `BACKUP_AND_RECOVERY.md`.

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

## Desplegar creación segura de usuarios

La sección Ajustes > Equipo y permisos usa Edge Functions para crear/invitar/eliminar usuarios en Supabase Auth sin exponer la `service_role` en el navegador.

```bash
npm run supabase:functions:deploy
```

Antes del primer despliegue, iniciar sesión y vincular el proyecto:

```bash
npm run supabase:login
npm run supabase:link -- --project-ref TU_PROJECT_REF
```

La función valida manualmente el JWT del usuario que llama, exige rol `owner/admin`, y usa `SUPABASE_SERVICE_ROLE_KEY` solo dentro del entorno seguro de Supabase.

Si tu proyecto no tiene configurada la variable `SUPABASE_SERVICE_ROLE_KEY` en Edge Functions, agregala desde Supabase Dashboard > Edge Functions > Secrets.

En Ajustes > Equipo y permisos:

- Si completás `Clave temporal`, el usuario entra con email + esa clave.
- Si dejás `Clave temporal` vacía, Supabase envía una invitación por email.
- La clave temporal debe tener al menos 8 caracteres.

## Modelo

`organización → cliente → vehículos → órdenes de trabajo → servicios/pagos/fotos/recibos`
