# ✅ Checklist de Despliegue: Membresías Club Autoestética

**Versión:** v1.0  
**Objetivo:** Desplegar la sección de membresías esta semana (semana del 23/07)  
**Estado base:** Lint ✅ | Tests ✅ | Build ✅

---

## 📋 FASE 1: PREPARACIÓN EN SUPABASE (30 minutos)

### 1.1 Aplicar migración SQL
- [ ] Ir a tu proyecto Supabase → SQL Editor
- [ ] Copiar el contenido de: `supabase/migrations/202607190001_club_plans.sql`
- [ ] Ejecutar en la BD de producción
- [ ] Verificar que las tablas se crearon: `public.admins` y `public.club_plans`
- [ ] Verificar que existen las políticas RLS

**Validación:**
```sql
SELECT * FROM public.club_plans LIMIT 1;
SELECT * FROM public.admins;
```

### 1.2 Crear el registro de admin real
- [ ] Obtener tu `auth.uid()` real desde Supabase Auth → Users
  - Copiar el UUID del usuario (es largo, similar a `12345678-abcd-1234-abcd-123456789012`)
- [ ] Ejecutar en SQL Editor:
  ```sql
  INSERT INTO public.admins (user_id) VALUES ('TU_AUTH_UID_AQUI');
  ```
- [ ] Verificar que se insertó correctamente:
  ```sql
  SELECT * FROM public.admins WHERE user_id = 'TU_AUTH_UID_AQUI';
  ```

### 1.3 Verificar políticas RLS
- [ ] Ir a Authentication → Policies en Supabase
- [ ] Confirmar que `club_plans` tiene:
  - **SELECT:** Pública (anyone can read)
  - **INSERT/UPDATE/DELETE:** Solo admin autenticado
- [ ] Confirmar que `admins` tiene:
  - **SELECT:** Pública o privada (no importa, la landing no la consulta)

---

## 📱 FASE 2: PROBAR EN LOCAL (1 hora)

### 2.1 Configurar variables de entorno locales
- [ ] Crear `.env.local` en la raíz del proyecto (o actualizar):
  ```
  VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
  VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA_ANON
  VITE_ORGANIZATION_SLUG=autoestetica-tucuman
  ```
- [ ] No cometer este archivo a git (ya debería estar en `.gitignore`)

### 2.2 Iniciar la app en local
```bash
npm install
npm run dev
```
- [ ] Abrir `http://localhost:5173`
- [ ] Verificar que no hay errores en la consola

### 2.3 Probar flujo público (landing)
- [ ] Abrir página de inicio (`/`)
- [ ] Bajar hasta la sección de membresías
- [ ] Debería ver: "Próximamente: Club Autoestética Tucumán..." (banner)
- [ ] Verificar en mobile que se ve bien

### 2.4 Probar panel admin
- [ ] Ir a `/admin/login`
- [ ] Iniciar sesión con tu usuario real de Supabase
- [ ] Ir a `/admin/club`
- [ ] Debería cargar sin errores de RLS
- [ ] Si dice "Tu usuario todavía no está autorizado", verificar que el SQL se insertó bien

### 2.5 Crear un plan de prueba en admin
- [ ] En `/admin/club`, hacer clic en "Nuevo plan"
- [ ] Llenar formulario:
  - Título: `Club Test Premium`
  - Subtítulo: `Plan de prueba para validar el flujo`
  - Precio: `25000`
  - Moneda: `ARS`
  - Agregar 3 características
  - URL de Mercado Pago: `https://www.mercadopago.com.ar/checkout/test` (o tu URL real)
  - Tarjeta Fidelity: activada
- [ ] Hacer clic en "Guardar plan"
- [ ] Verificar que aparece en la lista de planes sin errores

### 2.6 Activar el plan
- [ ] Hacer clic en el plan que acabas de crear
- [ ] Activar el toggle "Plan publicado"
- [ ] Hacer clic en "Guardar plan"
- [ ] Verificar en la consola que no hay errores

### 2.7 Verificar que aparece en landing
- [ ] Ir a `/` nuevamente (o recargar)
- [ ] Bajar hasta membresías
- [ ] Debería ver la tarjeta del plan (no el banner "Próximamente")
- [ ] Verificar que:
  - El título, precio y beneficios aparecen correctamente
  - El botón "Unirme al Club" es clickeable y apunta a la URL de Mercado Pago
  - La tarjeta Fidelity es visible
  - El botón "Pedir turno por WhatsApp" funciona

### 2.8 Desactivar el plan
- [ ] Volver a admin, desactivar el toggle
- [ ] Guardar
- [ ] Verificar que en la landing vuelve a aparecer el banner "Próximamente"

---

## 🚀 FASE 3: BUILD Y PRE-DEPLOY (30 minutos)

### 3.1 Correr todos los checks
```bash
npm run lint
npm run test:run
npm run build
npm run predeploy
```
- [ ] Todos deben pasar con ✅
- [ ] Si hay errores, revisar la consola

### 3.2 Verificar bundle size
- [ ] El build debería producir un `dist/` sin errores
- [ ] El tamaño gzipped del JS principal debería rondar ~131 KB (similar al build actual)
- [ ] Si es mucho más grande, revisar imports innecesarios

### 3.3 Limpiar archivos temporales
- [ ] `rm -r dist/` (si es necesario hacer limpieza)
- [ ] Confirmar que `node_modules` está presente

---

## 🌐 FASE 4: DESPLIEGUE A PRODUCCIÓN (1 hora)

### 4.1 Configurar variables en el hosting
**Para Vercel:**
- [ ] Ir a tu proyecto en Vercel → Settings → Environment Variables
- [ ] Añadir o actualizar:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_ORGANIZATION_SLUG`
- [ ] Confirmar que están configuradas

**Para Netlify:**
- [ ] Ir a Site settings → Build & deploy → Environment
- [ ] Añadir las mismas variables

### 4.2 Hacer push/deploy
**Si es con Git (Vercel/Netlify):**
```bash
git add .
git commit -m "feat: add club memberships system for deployment"
git push origin main
```
- [ ] Verificar que el despliegue comienza automáticamente
- [ ] Esperar a que termine (5-15 minutos)

**Si es manual (upload de dist):**
- [ ] Copiar contenido de `dist/` al hosting
- [ ] Verificar que el `_redirects` o `vercel.json` está en su lugar

### 4.3 Verificar que la app está viva
- [ ] Abrir tu dominio de producción
- [ ] Verificar que carga sin errores (consola del navegador)
- [ ] Ver que aparece el banner "Próximamente..."

---

## ✅ FASE 5: VALIDACIÓN EN PRODUCCIÓN (45 minutos)

### 5.1 Pruebas en desktop
- [ ] Abrir `/` en Desktop
- [ ] Bajar a membresías y verificar:
  - Banner "Próximamente" está presente
  - No hay errores de consola
  - Las animaciones funcionan suave
  - El responsive se ve bien en ancho completo

### 5.2 Pruebas en móvil (real device o device emulation)
- [ ] Abrir en iPhone 12 / Samsung Galaxy S21 (o similares)
- [ ] Verificar:
  - La sección de membresías es legible
  - El banner está centrado
  - Los botones son clickeables (al menos 48x48px)
  - No hay overflow horizontal
  - Las fuentes tienen contraste suficiente

### 5.3 Crear plan de prueba en producción
- [ ] Ir a `/admin/login` en producción
- [ ] Iniciar sesión
- [ ] Ir a `/admin/club`
- [ ] Crear un plan de prueba
- [ ] Activarlo
- [ ] Verificar que aparece en la landing pública
- [ ] Desactivarlo y confirmar que desaparece

### 5.4 Pruebas de enlaces
- [ ] En el plan, hacer clic en "Unirme al Club"
  - Debe abrir en nueva pestaña
  - Debe apuntar a la URL de Mercado Pago correcta
- [ ] En Fidelity, hacer clic en "Pedir turno por WhatsApp"
  - Debe abrir WhatsApp o web.whatsapp.com
  - El mensaje debe estar preformulado

### 5.5 Monitorear errores
- [ ] Ir a tu herramienta de logs (Sentry, LogRocket, o simples console.error)
- [ ] Verificar que no hay excepciones ni errores de RLS
- [ ] Si hay errores, revisar y corregir

---

## 📊 FASE 6: POST-DEPLOY (15 minutos)

### 6.1 Crear plan real
- [ ] Ya con la app en producción, crear el plan real del club
- [ ] Configurar:
  - Título: `Club Autoestética Premium`
  - Subtítulo y descripción final
  - Precio correcto
  - Beneficios reales
  - URL de checkout real de Mercado Pago
  - Tarjeta Fidelity: `true` o `false` según tu decisión
- [ ] Activarlo

### 6.2 Revisar landing pública
- [ ] Abrir `/` nuevamente
- [ ] Bajar a membresías
- [ ] Verificar que todo se ve como esperabas
- [ ] Compartir con un colega para validación visual

### 6.3 Anunciar
- [ ] Publicar en redes sociales o enviar email a clientes
- [ ] Mencionar que el Club está disponible
- [ ] Incluir link al checkout de Mercado Pago o a la landing

### 6.4 Monitoreo
- [ ] Verificar los primeros días:
  - ¿Hay clics en "Unirme al Club"?
  - ¿Funciona el checkout de Mercado Pago?
  - ¿Hay errores de RLS o permisos?
  - ¿El WhatsApp de Fidelity recibe mensajes?

---

## 🚨 TROUBLESHOOTING

### Problema: "Tu usuario todavía no está autorizado en public.admins"
**Solución:**
- [ ] Verificar que el UUID se insertó correctamente:
  ```sql
  SELECT * FROM public.admins;
  ```
- [ ] Si no aparece, re-ejecutar el INSERT con el UUID correcto
- [ ] Recargar la página después de insertar

### Problema: Mercado Pago checkout no funciona
**Solución:**
- [ ] Verificar que la URL es correcta (https y válida)
- [ ] Probar el link manualmente en una pestaña privada
- [ ] Usar una URL de testing de Mercado Pago primero

### Problema: Las imágenes de planes no carga
**Solución:**
- [ ] Verificar que la URL de imagen es HTTPS
- [ ] Verificar que el servidor de hosting permite acceso
- [ ] Usar placeholders si es necesario

### Problema: Errores de CORS en la consola
**Solución:**
- [ ] Verificar que `VITE_SUPABASE_URL` es correcta
- [ ] No debe haber slash final en la URL
- [ ] Verificar que la clave anon es válida

### Problema: El formulario admin no guarda
**Solución:**
- [ ] Revisar la consola para ver el error exacto
- [ ] Verificar que hay al menos 1 feature/beneficio
- [ ] Verificar que el precio es >= 0
- [ ] Si la URL de Mercado Pago está incompleta, eso también bloquea

---

## 📝 NOTAS IMPORTANTES

1. **NO uses SERVICE_ROLE_KEY en el cliente.** Solo ANON_KEY.
2. **Mercado Pago:** Por ahora usas links estáticos. En el futuro, genera el checkout desde un endpoint server para más seguridad.
3. **Webhooks de pago:** Si quieres sincronizar pagos reales con tu BD, necesitarás un endpoint que reciba webhooks de Mercado Pago.
4. **Primer mes:** Manten activado el plan de prueba en la landing para que los clientes vean la propuesta. Pasado 1-2 meses, puedes cambiar el mensaje del banner "Próximamente" si lo desactivas.

---

## ✨ Una vez completado

- [ ] La landing está en vivo con la sección de membresías
- [ ] El panel admin funciona para crear/editar/borrar planes
- [ ] El feature flag `is_active` controla si se muestra públicamente
- [ ] El checkout de Mercado Pago está vinculado
- [ ] La Tarjeta Fidelity opcional se puede activar/desactivar
- [ ] Todos los tests pasan
- [ ] No hay errores en producción
- [ ] Las redes sociales están notificadas (opcional pero recomendado)

---

**Estimado de tiempo total:** 4-5 horas (la mayoría es validación y testing)  
**Mejor momento:** Martes o Miércoles para tener 1-2 días de monitoreo antes del fin de semana

¡Vamos! 🚀
