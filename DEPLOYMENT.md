# Despliegue personal de Autoestética Tucumán

## Variables obligatorias

```text
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA_ANON
VITE_ORGANIZATION_SLUG=autoestetica-tucuman
```

Usar solamente la clave pública `anon`. Nunca publicar `service_role`.

## Supabase Authentication

En Authentication > URL Configuration configurar el dominio final como `Site URL` y agregar `https://TU_DOMINIO/admin/login` en Redirect URLs. Para uso personal, mantener deshabilitado el registro público y crear manualmente únicamente los usuarios autorizados.

## Compilación

```powershell
npm install
npm run lint
npm run build
```

Antes de publicar, también se puede ejecutar `npm run predeploy`. Este control rechaza variables faltantes, valores de ejemplo, URLs inválidas y una clave identificada como `service_role`, y luego ejecuta lint y build.

Publicar el directorio `dist`. El proyecto incluye reglas SPA para Netlify (`public/_redirects`) y Vercel (`vercel.json`).

## Verificación posterior

1. Abrir Inicio, Servicios, Galería, Consulta y Contacto.
2. Recargar directamente `/servicios` y confirmar que no devuelve 404.
3. Iniciar sesión desde `/admin/login`.
4. Recargar directamente `/admin/dashboard` y `/admin/caja`.
5. Confirmar que servicios, galería, contacto y footer leen Supabase.
6. Crear un turno de prueba sin cobro y luego eliminarlo.
7. Generar un recibo y comprobar logo, servicios y total.
8. Probar desde un teléfono el menú inferior y WhatsApp.
9. Ejecutar `supabase/VERIFY_DATABASE.sql`.
10. Confirmar un respaldo reciente antes de usar Caja con datos reales.

El dominio debe usar HTTPS para Supabase Auth, PWA, service worker y compartir recibos.
