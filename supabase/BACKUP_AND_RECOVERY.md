# Respaldo y recuperación

## Frecuencia recomendada

- Base de datos: respaldo diario automático desde Supabase y exportación manual antes de cada migración.
- Storage: copia semanal de los buckets `portfolio` y `work-photos`.
- Código: cada versión estable debe quedar guardada en Git antes del despliegue.
- Prueba de recuperación: una vez por mes en un proyecto Supabase separado.

## Antes de una migración

1. Abrir Supabase Dashboard > Database > Backups y confirmar que existe un respaldo reciente.
2. Exportar las tablas operativas: `clients`, `vehicles`, `services`, `work_orders`, `work_order_items`, `payments`, `cash_movements`, `receipts`, `receipt_items`, `business_settings`, `schedule_blocks`, `cash_closures` y `audit_logs`.
3. Ejecutar `BACKUP_CHECK.sql` y guardar el resultado junto con la fecha.
4. Aplicar la migración.
5. Ejecutar `VERIFY_DATABASE.sql` y comparar los conteos.

## Recuperación

1. No restaurar directamente sobre producción sin probar primero.
2. Crear un proyecto temporal y restaurar allí el respaldo.
3. Ejecutar `VERIFY_DATABASE.sql`.
4. Comprobar acceso, clientes, agenda, Caja, servicios, galería y recibos.
5. Recién después programar la restauración del proyecto productivo.

Nunca guardar la clave `service_role` en el repositorio, el navegador ni archivos `.env` publicados.
