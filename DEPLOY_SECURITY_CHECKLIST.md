# Checklist de seguridad para producción

## Antes de publicar

- [ ] `npm run predeploy` termina correctamente.
- [ ] `npm audit --omit=dev` fue revisado y sus alertas conocidas están documentadas.
- [ ] `.env`, `.env.local` y claves privadas no están versionados.
- [ ] El frontend contiene únicamente la clave pública de Supabase.
- [ ] Las migraciones locales y remotas coinciden.
- [ ] `supabase db lint --linked --level warning` no devuelve problemas.
- [ ] Las Edge Functions `create-team-member`, `delete-team-member` y `submit-public-inquiry` están activas.
- [ ] `VERIFY_DATABASE.sql` y `VERIFY_OPERATIONAL_FLOW.sql` devuelven cero problemas.
- [ ] Existe un respaldo reciente y verificable.
- [ ] `npm run backup:db` generó esquema, datos, roles y checksums antes de migrar.
- [ ] Los buckets `portfolio` y `work-photos` tienen copia separada.
- [ ] Se completó una restauración de prueba durante el último mes.

## Supabase

- [ ] RLS está habilitado en tablas con datos del negocio.
- [ ] Las escrituras administrativas exigen rol `owner` o `admin`.
- [ ] Tarjetas y troqueles no tienen políticas de escritura directa.
- [ ] Solamente `owner` administra equipo y configuración sensible.
- [ ] El alta y baja de usuarios se realiza mediante Edge Functions.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` existe solo como secreto de las Edge Functions.
- [ ] El registro público de usuarios está deshabilitado si no se utiliza onboarding público.
- [ ] Confirmación de email y protección de contraseñas filtradas están activas.
- [ ] Owner y admin completaron el alta de MFA y acceden con `aal2`.
- [ ] `Site URL` y `Redirect URLs` apuntan al dominio HTTPS definitivo.

## Hosting

- [ ] Están configuradas las variables Supabase y organización.
- [ ] `PUBLIC_SITE_ORIGINS` está configurado en Supabase con los dominios autorizados.
- [ ] `submit-public-inquiry` se actualizó antes de publicar el frontend mediante `npm run supabase:function:inquiry:deploy` (`--no-verify-jwt`).
- [ ] HTTPS está activo.
- [ ] Las rutas SPA recargan sin devolver 404.
- [ ] Los encabezados CSP, anti-iframe, referrer y permissions están presentes.
- [ ] La consola no muestra bloqueos CSP ni errores de conexión con Supabase.

## Prueba funcional

- [ ] Consulta pública registrada y visible como nueva.
- [ ] El honeypot y los límites de frecuencia bloquean envíos automatizados y repetidos.
- [ ] La tarjeta no abre solo con teléfono; sí abre con enlace secreto o código.
- [ ] Turno confirmado sin reemplazar otros de la misma franja.
- [ ] Descuento reflejado en orden, pago, caja y recibo.
- [ ] Cliente ocasional/promovido conserva el comportamiento esperado.
- [ ] Tarjeta creada por vehículo al confirmar.
- [ ] Finalizar un turno agrega exactamente un troquel.
- [ ] Repetir la finalización no duplica el troquel.
- [ ] Eliminar un turno conserva caja; eliminar un cliente conserva sus movimientos financieros.
- [ ] Permisos comprobados con owner, admin y empleado.
- [ ] Pantallas comprobadas en celular, tablet y escritorio.

## Incidentes

Ante una falla, conservar los datos y revisar en este orden:

1. Logs del despliegue.
2. Consola y red del navegador.
3. Logs de API, Auth y Edge Functions de Supabase.
4. Historial de migraciones.

Si la regresión afecta producción, restaurar el despliegue frontend anterior desde Vercel/Netlify. No revertir migraciones destructivamente sin un respaldo y un plan de recuperación.
