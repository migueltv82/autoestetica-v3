# Respaldo y recuperación

## Frecuencia recomendada

- Base de datos: respaldo diario automático desde Supabase y exportación manual antes de cada migración.
- Storage: copia semanal de los buckets `portfolio` y `work-photos`.
- Código: cada versión estable debe quedar guardada en Git antes del despliegue.
- Prueba de recuperación: una vez por mes en un proyecto Supabase separado.

Objetivo operativo inicial: perder como máximo 24 horas de datos (RPO) y recuperar el servicio en menos de 4 horas (RTO). Para reducir el RPO se necesita un plan de Supabase con respaldos más frecuentes o recuperación a un punto en el tiempo.

## Antes de una migración

1. Abrir Supabase Dashboard > Database > Backups y confirmar que existe un respaldo reciente y exitoso.
2. Ejecutar `npm run backup:db`. Requiere el proyecto vinculado y Docker disponible para Supabase CLI.
3. Ejecutar `BACKUP_CHECK.sql` y guardar el resultado junto con la fecha y los `checksums.csv` del respaldo.
4. Copiar `backups/AAAAMMDD-HHMMSS` a almacenamiento cifrado fuera de la computadora. La carpeta local está ignorada por Git.
5. Exportar por separado los objetos de Storage de `portfolio` y `work-photos`; el dump PostgreSQL conserva metadatos, no los archivos binarios.
6. Aplicar la migración.
7. Ejecutar `VERIFY_DATABASE.sql` y comparar los conteos.

## Recuperación

1. No restaurar directamente sobre producción sin probar primero.
2. Crear un proyecto temporal y restaurar allí el respaldo.
3. Ejecutar `VERIFY_DATABASE.sql`.
4. Comprobar acceso, clientes, agenda, Caja, servicios, galería y recibos.
5. Recién después programar la restauración del proyecto productivo.

Una copia no se considera verificada hasta completar una restauración de prueba. Registrar mensualmente fecha, responsable, respaldo usado, duración y resultado.

Nunca guardar la clave `service_role` en el repositorio, el navegador ni archivos `.env` publicados.
