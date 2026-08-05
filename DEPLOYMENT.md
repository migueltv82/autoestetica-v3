# Despliegue personal de Autoestética Tucumán

## Variables obligatorias

```text
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA_ANON
VITE_ORGANIZATION_SLUG=autoestetica-tucuman
VITE_TURNSTILE_SITE_KEY=TU_CLAVE_PUBLICA_TURNSTILE
```

Usar solamente la clave pública `anon`. Nunca publicar `service_role`.

## Protección del formulario público

1. Crear un widget gratuito en Cloudflare Turnstile para el dominio definitivo y `localhost`.
2. Cargar la clave pública como `VITE_TURNSTILE_SITE_KEY` en el hosting.
3. Cargar la clave secreta y los orígenes permitidos en Supabase:

```powershell
npx supabase secrets set TURNSTILE_SECRET_KEY=TU_CLAVE_SECRETA PUBLIC_SITE_ORIGINS=https://TU_DOMINIO
```

`PUBLIC_SITE_ORIGINS` admite varios valores separados por coma. La clave secreta nunca va en Vercel ni en archivos del repositorio.

## Supabase Authentication

En Authentication > URL Configuration configurar el dominio final como `Site URL` y agregar `https://TU_DOMINIO/admin/login` y `https://TU_DOMINIO/admin/restablecer-clave` en Redirect URLs. Para desarrollo local agregar también `http://localhost:5173/admin/restablecer-clave`. En Authentication > Providers > Email, deshabilitar el registro público, exigir confirmación de email y activar la protección de contraseñas filtradas si el plan la ofrece. Owner y admin tienen MFA TOTP obligatorio desde la aplicación.

## Compilación

Primero sincronizar la infraestructura de Supabase:

```powershell
npm run supabase:migrations:list
npm run supabase:db:push
npm run supabase:functions:deploy
```

Luego validar el frontend:

```powershell
npm install
npm run predeploy
```

Antes de publicar, también se puede ejecutar `npm run predeploy`. Este control rechaza variables faltantes, valores de ejemplo, URLs inválidas y una clave identificada como `service_role`, y luego ejecuta lint y build.

Publicar el directorio `dist`. El proyecto incluye reglas SPA para Netlify (`public/_redirects`) y Vercel (`vercel.json`).

Si el repositorio está conectado al hosting, publicar con `git push origin main`. Configurar las tres variables obligatorias también en el panel del proveedor antes de iniciar el despliegue.

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
