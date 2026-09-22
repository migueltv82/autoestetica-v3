# Supabase — Autoestética Tucumán

Supabase es la única fuente de verdad de la aplicación. Este directorio contiene el historial del esquema, funciones de servidor, verificaciones y procedimientos operativos.

## Contenido

- `migrations/`: cambios de esquema inmutables y ordenados cronológicamente.
- `functions/`: Edge Functions para administrar usuarios sin exponer secretos.
- `VERIFY_DATABASE.sql`: controles generales de integridad y seguridad.
- `VERIFY_OPERATIONAL_FLOW.sql`: controles del flujo de turnos, caja y fidelización.
- `BACKUP_CHECK.sql`: validación de un respaldo.
- `BACKUP_AND_RECOVERY.md`: procedimiento de respaldo y recuperación.
- `RESET_DATABASE.sql`: reinicio destructivo, solo para una instalación descartable.

## Convención de migraciones

El nombre sigue `AAAAMMDDNNNN_descripcion.sql`. Una migración aplicada no se edita, renombra ni elimina: cualquier corrección se agrega como una migración nueva. Cada archivo debe indicar al comienzo su propósito y, cuando corresponda, su impacto sobre datos, permisos o compatibilidad.

### Catálogo funcional

| Serie | Alcance |
| --- | --- |
| `20260714*` | Esquema inicial, catálogo público y servicios base |
| `20260715*` | Precios, integridad, agenda, caja y planes SaaS |
| `20260716*` | Alta del negocio, recibos, mensajes, realtime, operaciones atómicas y auditoría |
| `20260717*`–`20260718*` | Roles, permisos y administración segura del equipo |
| `20260719*` | Planes del club |
| `20260722*` | Configuración visual de transformaciones |
| `20260723*` | Unicidad de teléfono de clientes activos |
| `20260724*`–`202607250002` | Fidelización y tarjetas por vehículo |
| `202607250003` | Descuentos en órdenes de trabajo |
| `202607250004`–`202607250008` | Alta opcional, promoción, baja e historial de clientes |
| `202607250009` | Edición manual de troqueles |
| `202607250010`–`202607250012` | Consultas públicas y estado leído/no leído |
| `202607250013` | Turnos superpuestos sin reemplazar reservas existentes |
| `202607260001` | Troquel Fidelity transaccional e idempotente por turno |
| `202607260002` | Escrituras de fidelización cerradas y RPC por rol |
| `202607260003` | Acceso privado a tarjetas mediante token y código |
| `202607260004` | Consulta pública con límite de frecuencia y ejecución desde Edge Function |

## Instalación limpia

1. Crear un proyecto Supabase y esperar a que esté operativo.
2. Configurar las variables Supabase y `VITE_ORGANIZATION_SLUG` en `.env.local`.
3. Iniciar sesión y vincular el CLI:

   ```bash
   npm run supabase:login
   npm run supabase:link -- --project-ref TU_PROJECT_REF
   ```

4. Aplicar las migraciones:

   ```bash
   npm run supabase:db:push
   ```

5. Crear el usuario propietario en Authentication > Users y vincularlo a la organización.
6. Configurar `PUBLIC_SITE_ORIGINS` como indica [DEPLOYMENT.md](../DEPLOYMENT.md) y desplegar las Edge Functions con `npm run supabase:functions:deploy` antes de publicar el frontend. El script de `submit-public-inquiry` incluye `--no-verify-jwt` para recibir consultas sin sesión de usuario.
7. Ejecutar `VERIFY_DATABASE.sql` y `VERIFY_OPERATIONAL_FLOW.sql` desde SQL Editor.

## Vincular el propietario

Reemplazar el correo antes de ejecutar:

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
on conflict (id) do update
set organization_id = excluded.organization_id, role = 'owner', active = true;

insert into public.business_settings (organization_id, business_name, address, whatsapp)
select id, 'Autoestética Tucumán', 'Tucumán, Argentina', '+54 9 381 5448147'
from public.organizations where slug = 'autoestetica-tucuman'
on conflict (organization_id) do update set business_name = excluded.business_name;
```

## Seguridad

- El frontend usa únicamente la clave pública (`anon`).
- `SUPABASE_SERVICE_ROLE_KEY` vive solo en los secretos de Edge Functions.
- `PUBLIC_SITE_ORIGINS` limita el formulario a los dominios autorizados.
- El formulario público conserva el honeypot y los límites de frecuencia en el servidor.
- Owner y admin deben completar MFA TOTP antes de entrar al panel.
- Las funciones de equipo validan el JWT y exigen rol `owner` o `admin`.
- Las políticas RLS y funciones RPC son parte del esquema versionado; no deben mantenerse solo desde el Dashboard.
- `RESET_DATABASE.sql` elimina datos. Revisar el proyecto seleccionado y disponer de respaldo antes de usarlo.

## Flujo de publicación

```bash
npm run supabase:migrations:list
npm run supabase:db:push
npm run supabase:functions:deploy
npm run check
```

Después del despliegue, ejecutar ambas verificaciones SQL y probar consulta → turno → confirmación → tarjeta → finalización → troquel.
