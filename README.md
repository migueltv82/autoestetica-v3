# Autoestética Tucumán

Aplicación web para gestionar un negocio de detailing automotriz. Reúne el sitio público, consultas, agenda, clientes y vehículos, órdenes de trabajo, caja, recibos, fidelización y administración del equipo en una sola plataforma.

## Funcionalidades

### Sitio público

- Catálogo de servicios y galería de trabajos.
- Formulario de consultas con seguimiento de leídas/no leídas.
- Contacto y confirmaciones por WhatsApp.
- Acceso del cliente a sus tarjetas mediante enlace privado o teléfono más código.
- Formulario protegido con Turnstile, honeypot y límites de frecuencia.
- Tarjeta independiente por vehículo y animación al completar el premio.

### Administración

- Agenda diaria, semanal, mensual, listado y tablero.
- Turnos superpuestos, bloqueos de agenda y estados operativos.
- Alta opcional de clientes desde turnos y consultas.
- Fichas de clientes, vehículos e historial en ventanas modales.
- Servicios, precios por vehículo, descuentos y publicación independiente.
- Caja, pagos, cierres, recibos y anulación de órdenes.
- Tarjetas y troqueles de fidelización, automáticos o manuales.
- Roles, permisos y administración del equipo.

## Tecnología

- React 19 y React Router
- Vite
- Supabase (PostgreSQL, Auth, Storage, Realtime y Edge Functions)
- Framer Motion y Lucide React
- Vitest, Testing Library y ESLint

## Puesta en marcha

Requisitos: Node.js 20 o superior, npm y un proyecto Supabase.

```bash
npm install
```

Crear `.env.local` en la raíz:

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
VITE_ORGANIZATION_SLUG=autoestetica-tucuman
VITE_TURNSTILE_SITE_KEY=TU_CLAVE_PUBLICA_TURNSTILE
```

La clave `service_role` nunca debe incluirse en el frontend ni en archivos versionados.

Para iniciar el entorno local:

```bash
npm run dev
```

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run check` | Lint, pruebas y build de producción |
| `npm run test` | Pruebas en modo interactivo |
| `npm run predeploy` | Controles de entorno y validación completa |
| `npm run preview` | Vista previa del build |
| `npm run backup:db` | Dump versionado por fecha con checksums (no incluye archivos de Storage) |
| `npm run supabase:migrations:list` | Estado de migraciones locales/remotas |
| `npm run supabase:db:push` | Aplicar migraciones pendientes al proyecto vinculado |
| `npm run supabase:functions:deploy` | Publicar funciones del equipo y consulta protegida |

## Estructura

```text
src/
  components/    componentes reutilizables de UI, agenda y layout
  context/       autenticación y notificaciones globales
  hooks/         acceso reutilizable a datos y estado
  pages/         pantallas públicas y administrativas
  services/      operaciones contra Supabase
  styles/        variables, estilos globales y adaptación responsive
  utils/         reglas puras, formatos y enlaces de WhatsApp
supabase/
  functions/     Edge Functions con privilegios de servidor
  migrations/    evolución versionada de la base de datos
scripts/         verificaciones previas al despliegue
```

## Base de datos

Las migraciones son la fuente de verdad del esquema. No se deben editar ni renombrar migraciones ya aplicadas; cada cambio nuevo lleva un archivo posterior con formato `AAAAMMDDNNNN_descripcion.sql`.

La instalación, el catálogo de migraciones, las verificaciones y la recuperación están documentados en [supabase/README.md](supabase/README.md). Antes de desplegar cambios de base de datos se recomienda ejecutar `VERIFY_DATABASE.sql` y conservar un respaldo verificable.

## Calidad y despliegue

Antes de integrar o publicar cambios:

```bash
npm run check
npm run predeploy
```

Guías adicionales:

- [Despliegue completo](DEPLOYMENT.md)
- [Despliegue rápido](QUICK_DEPLOY.md)
- [Seguridad](DEPLOY_SECURITY_CHECKLIST.md)
- [Política técnica de seguridad](SECURITY.md)
- [Backups y recuperación](supabase/BACKUP_AND_RECOVERY.md)
- [Membresías y permisos](DEPLOYMENT_CHECKLIST_MEMBERSHIPS.md)
- [Modelo de membresías](docs/club-memberships.md)

## Convenciones de mantenimiento

- Mantener consultas a Supabase en `src/services` y reglas reutilizables en `src/utils`.
- Reutilizar componentes de `src/components/ui` para modales, estados vacíos y carga.
- Usar las variables de `src/styles/variables.css`; evitar colores o medidas duplicados cuando ya exista un token.
- Validar vistas de celular, tablet y escritorio después de cambios visuales.
- No eliminar datos operativos mediante código del frontend sin respetar las funciones y políticas definidas en las migraciones.
