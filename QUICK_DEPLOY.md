# 🎯 Quick Deploy Guide - Comandos listos para copiar/pegar

**Use este archivo para no perder tiempo en setup. Todos los comandos están listos.**

---

## ⚡ Quick Start (5 minutos)

### 1️⃣ Clonar/actualizar repo
```bash
cd C:\Users\User\Desktop\autoestetica-v3
git pull origin main
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar .env.local
Crear archivo `.env.local` en la raíz:
```
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY_AQUI
VITE_ORGANIZATION_SLUG=autoestetica-tucuman
```

**⚠️ NO cometer esto a git. Está en `.gitignore`.**

---

## 🧪 Validar que todo funciona (10 minutos)

### Lint
```bash
npm run lint
```
✅ Debe pasar sin errores

### Tests
```bash
npm run test:run
```
✅ Debe pasar: 24/24 tests OK

### Build
```bash
npm run build
```
✅ Debe crear carpeta `dist/` sin errores

### Pre-deploy (opcional pero recomendado)
```bash
npm run predeploy
```
✅ Valida variables, lint, build

---

## 🗄️ Preparar Supabase (30 minutos)

### 1️⃣ Ejecutar migración SQL

**Opción A: SQL Editor en Supabase web**
1. Ir a: `https://app.supabase.com/` → Seleccionar proyecto
2. SQL Editor → New query
3. Copiar todo el contenido de:
   ```
   supabase/migrations/202607190001_club_plans.sql
   ```
4. Ejecutar (botón ▶️)
5. Verificar que las tablas se crearon sin errores

**Opción B: Supabase CLI (avanzado)**
```bash
supabase db push
```

### 2️⃣ Verificar que las tablas existen
En SQL Editor, ejecutar:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('club_plans', 'admins');
```

Debe retornar 2 filas.

### 3️⃣ Obtener tu auth.uid() real

**Opción A: Desde Supabase web**
- Ir a: Authentication → Users
- Hacer clic en tu usuario
- Copiar el UUID (el que aparece arriba)

**Opción B: Desde una función de JavaScript**
```javascript
// En browser console después de iniciar sesión:
const { data: { user } } = await supabase.auth.getUser();
console.log(user.id); // Copiar este valor
```

### 4️⃣ Crear tu admin en la BD
En SQL Editor, ejecutar:
```sql
INSERT INTO public.admins (user_id) 
VALUES ('PEGA_TU_AUTH_UID_AQUI');
```

Ejemplo:
```sql
INSERT INTO public.admins (user_id) 
VALUES ('12345678-90ab-cdef-1234-567890abcdef');
```

### 5️⃣ Verificar que se insertó
```sql
SELECT * FROM public.admins;
```

Debe mostrar 1 fila con tu user_id.

---

## 💻 Probar localmente (45 minutos)

### Iniciar servidor local
```bash
npm run dev
```

Debería salir algo como:
```
  VITE v8.0.16  ready in 543 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Abrir en navegador
- Ir a: `http://localhost:5173`

### Test 1: Landing sin plan (debería ver "Próximamente")
1. Bajar hasta sección membresías
2. Debería ver banner amarillo: "Próximamente: Club Autoestética..."
3. Abrir console (F12) → no debe haber errores

### Test 2: Admin login
1. Ir a: `http://localhost:5173/admin/login`
2. Iniciar sesión con tu cuenta Supabase
3. Ir a: `http://localhost:5173/admin/club`
4. Debería cargar sin errores (si no, revisar console)

### Test 3: Crear plan de prueba
1. Hacer clic en "Nuevo plan"
2. Llenar:
   ```
   Título: Test Plan Premium
   Subtítulo: Plan de prueba
   Precio: 25000
   Moneda: ARS
   Características: 
     - Beneficio 1
     - Beneficio 2
   Checkout URL: https://www.mercadopago.com.ar/checkout/test
   Fidelity: activado
   ```
3. Hacer clic en "Guardar plan"
4. Debe aparecer en la lista sin errores

### Test 4: Activar y ver en landing
1. Hacer clic en el plan recién creado
2. Activar toggle "Plan publicado"
3. Guardar
4. Ir a: `http://localhost:5173`
5. Bajar a membresías
6. Debería ver la tarjeta del plan (no el banner "Próximamente")
7. Verificar botones:
   - "Unirme al Club" → clicable, abre en nueva pestaña
   - "Pedir turno por WhatsApp" → abre WhatsApp/web.whatsapp.com

### Test 5: Desactivar
1. Volver a admin
2. Desactivar toggle
3. Guardar
4. Ir a landing nuevamente
5. Debería volver a ver el banner "Próximamente"

### Test 6: Móvil (opcional pero recomendado)
1. Abrir DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Seleccionar iPhone 12 o Galaxy S21
4. Verificar:
   - No hay overflow horizontal
   - Botones son clickeables
   - Texto es legible

---

## 🚀 Deploy a Producción (30 minutos)

### Opción A: Push a Git (para Vercel/Netlify automático)
```bash
git add -A
git commit -m "feat: add club memberships system - deploy ready"
git push origin main
```

Vercel/Netlify detectará el push y desplegará automáticamente.

**Esperar tiempo estimado:**
- Vercel: 2-5 minutos
- Netlify: 5-15 minutos

Ir a: Vercel/Netlify dashboard → Deployments → Ver el nuevo deploy

### Opción B: Manual (si tu hosting no tiene auto-deploy)
```bash
# Generar build
npm run build

# Subir la carpeta 'dist' a tu hosting
# Los pasos dependen de tu proveedor (cPanel, FTP, etc.)
```

---

## ✅ Validar Despliegue en Vivo (20 minutos)

### 1️⃣ Abrir sitio en producción
- Ir a: `https://www.tudominio.com`
- Verificar que carga sin errores (F12 console)

### 2️⃣ Crear plan de prueba en producción
1. Ir a: `https://www.tudominio.com/admin/login`
2. Iniciar sesión
3. Ir a: `https://www.tudominio.com/admin/club`
4. Crear plan:
   ```
   Título: Club Premium
   Precio: 29900
   Características: mínimo 2
   Checkout: Tu URL real de Mercado Pago
   ```
5. Guardar

### 3️⃣ Validar en landing
1. Ir a: `https://www.tudominio.com`
2. Bajar a membresías
3. Debería ver la tarjeta del plan
4. Probar botones:
   - "Unirme al Club" debe abrir Mercado Pago
   - "Pedir turno" debe abrir WhatsApp

### 4️⃣ Probar en móvil
- Abrir en tu teléfono: `https://www.tudominio.com`
- Bajar a membresías
- Verificar que se ve bien
- Verificar que botones funcionan

### 5️⃣ Monitorear errores
- Abrir DevTools (F12)
- Ir a Console
- Esperar 30 segundos
- No debería haber errores (advertencias OK)

Si hay error tipo "Not authenticated" o "RLS policy error":
1. Revisar que admin está en la BD: `SELECT * FROM public.admins;`
2. Revisar que políticas RLS son correctas
3. Revisar que VITE_SUPABASE_ANON_KEY está configurada en Vercel/Netlify

---

## 🔧 Troubleshooting Rápido

### ❌ Error: "Tu usuario todavía no está autorizado"
```sql
-- Verificar:
SELECT * FROM public.admins;

-- Si no aparece nada, insertar nuevamente:
INSERT INTO public.admins (user_id) 
VALUES ('TU_AUTH_UID_REAL');
```

### ❌ Error: "VITE_SUPABASE_URL is undefined"
- [ ] Verificar `.env.local` está en la raíz (no en una subcarpeta)
- [ ] Reiniciar servidor: Ctrl+C, luego `npm run dev`
- [ ] Si es en producción, verificar variables en Vercel/Netlify

### ❌ Error: "Falta URL de Mercado Pago"
- [ ] En admin, el campo "URL de Mercado Pago" está vacío
- [ ] Debe ser: https://www.mercadopago.com.ar/... (HTTPS obligatorio)

### ❌ Error: "White screen" o página no carga
1. Abrir DevTools (F12)
2. Ver Console → verificar errores
3. Copiar error y buscar en:
   - Documentación Supabase
   - Google / Stack Overflow

### ❌ Botones no funcionan
- Verificar que el checkout_url es válido (HTTPS)
- Probar en otra pestaña: pegar directamente la URL
- Verificar que WhatsApp está configurado en settings

---

## 📋 Checklist Final (antes de anunciar)

- [ ] Landing en producción carga sin errores
- [ ] Plan activo se ve en la sección de membresías
- [ ] Botón "Unirme al Club" abre Mercado Pago
- [ ] Botón "Pedir turno" abre WhatsApp
- [ ] Tarjeta Fidelity es visible (si la activaste)
- [ ] Se ve bien en móvil
- [ ] No hay errores en console (F12)
- [ ] Admin panel funciona para crear/editar planes
- [ ] Desactivar plan → landing muestra "Próximamente"
- [ ] Activar plan → landing muestra tarjeta

✅ Si todos pasan → **Listo para anunciar en redes sociales**

---

## 📞 Links útiles

- Supabase Console: https://app.supabase.com
- Vercel Dashboard: https://vercel.com/dashboard
- Netlify Dashboard: https://app.netlify.com
- Mercado Pago: https://www.mercadopago.com.ar

---

## ⏱️ Timing estimado

| Tarea | Tiempo |
|-------|--------|
| Setup local | 10 min |
| Validar build | 5 min |
| Preparar Supabase | 30 min |
| Probar en local | 45 min |
| Deploy a producción | 15 min |
| Validar en vivo | 20 min |
| **TOTAL** | **~2 horas** |

Si todo corre bien, puedes hacerlo en una sola sesión de trabajo.

---

**Estado:** Listo para copiar/pegar 🚀  
**Última actualización:** 23/07/2026  
**Próximo paso:** Ejecutar `npm run dev` y seguir los tests
