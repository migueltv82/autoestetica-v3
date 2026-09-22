# Seguridad

## Alcance

La autorización real vive en Supabase: RLS separa organizaciones y las operaciones privilegiadas validan sesión, organización, usuario activo y rol. Ocultar botones en React es una ayuda visual, no una barrera de seguridad.

## Dependencias conocidas

`npm audit --omit=dev` informa alertas en `react-router` sin versión corregida disponible al 26-07-2026. La aplicación no usa SSR, React Server Components ni rutas externas dinámicas. Los retornos posteriores al login y MFA se validan con rutas `/admin`, mitigando el vector de redirección abierta. Revisar el audit en cada despliegue y actualizar apenas exista una corrección compatible.

No ejecutar `npm audit fix --force`: un cambio mayor automático puede romper autenticación y navegación sin eliminar necesariamente el riesgo.

## Secretos

- El navegador recibe únicamente claves `VITE_*` públicas.
- `SUPABASE_SERVICE_ROLE_KEY` vive exclusivamente en secretos de Edge Functions.
- Ante una exposición, rotar la clave afectada, invalidar sesiones y revisar logs antes de volver a publicar.

## Reporte de incidentes

No publicar datos personales, tokens ni capturas de clientes en issues públicos. Registrar hora, usuario, acción y logs relacionados; preservar evidencia antes de restaurar o modificar datos.
