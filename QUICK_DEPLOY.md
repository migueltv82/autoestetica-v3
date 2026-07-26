# Despliegue rápido

Esta es la secuencia corta y segura para publicar Autoestética Tucumán. La explicación completa está en [DEPLOYMENT.md](DEPLOYMENT.md).

## 1. Preparar Supabase

```powershell
npm run supabase:migrations:list
npm run supabase:db:push
npm run supabase:functions:deploy
```

Después, ejecutar desde SQL Editor:

1. `supabase/VERIFY_DATABASE.sql`
2. `supabase/VERIFY_OPERATIONAL_FLOW.sql`

Las columnas llamadas `problemas` deben devolver `0`.

## 2. Configurar el hosting

Agregar en Vercel o Netlify, para Producción y Preview:

```text
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
VITE_ORGANIZATION_SLUG=autoestetica-tucuman
VITE_TURNSTILE_SITE_KEY=TU_CLAVE_PUBLICA_TURNSTILE
```

No agregar `SUPABASE_SERVICE_ROLE_KEY` al hosting del frontend.

Antes de desplegar las funciones, configurar `TURNSTILE_SECRET_KEY` y `PUBLIC_SITE_ORIGINS` siguiendo `DEPLOYMENT.md`.

En Supabase > Authentication > URL Configuration:

- `Site URL`: el dominio definitivo.
- `Redirect URLs`: `https://TU_DOMINIO/admin/login`.

## 3. Validar y publicar

```powershell
npm install
npm run predeploy
git status --short
git push origin main
```

Con el repositorio conectado, Vercel o Netlify desplegará automáticamente. La salida de compilación es `dist` y el comando es `npm run build`.

## 4. Control posterior

- Abrir y recargar directamente `/`, `/servicios`, `/consulta`, `/tarjeta` y `/admin/login`.
- Iniciar sesión y probar agenda, clientes, caja y fidelización.
- Enviar una consulta real controlada.
- Confirmar y finalizar un turno de prueba: debe crear la tarjeta y un solo troquel.
- Revisar consola y red del navegador; no debe haber errores CSP, RLS ni rutas 404.
- Verificar celular y tablet reales.

Si el despliegue falla, no aplicar cambios manuales sobre datos: revisar primero los logs del hosting y de Supabase, y volver al despliegue anterior desde el panel del proveedor.
