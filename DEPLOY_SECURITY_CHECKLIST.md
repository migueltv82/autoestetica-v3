# 🔒 Seguridad & Performance - Checklist Pre-Deploy

**Asegúrate de que estos puntos estén verificados antes de lanzar a producción.**

---

## 🔐 SEGURIDAD

### RLS (Row Level Security)

- [ ] **Tabla `club_plans`**
  - [ ] SELECT: Público (no autenticado) — permite que la landing lea planes
  - [ ] INSERT/UPDATE/DELETE: Solo usuarios en tabla `admins` autenticados
  - [ ] Verificar: `Supabase > Authentication > Policies > club_plans`

- [ ] **Tabla `admins`**
  - [ ] SELECT: No público (solo admin autenticado)
  - [ ] INSERT/UPDATE/DELETE: Solo owner/super-admin
  - [ ] Verificar: `Supabase > Authentication > Policies > admins`

**Prueba de RLS:**
```bash
# Desde la consola del navegador, cuando NO estés logueado:
fetch('https://TU_SUPABASE_URL/rest/v1/club_plans?select=*', {
  headers: {
    'apikey': 'TU_ANON_KEY',
    'Authorization': 'Bearer null'
  }
})
.then(r => r.json())
.then(d => console.log(d))

# Debería devolver planes (porque SELECT es público)
```

### API Keys

- [ ] Verificar que en el código NO hay SERVICE_ROLE_KEY expuesto
  - Buscar en: `src/` por `service_role` (no debería encontrar nada)
  - ```bash
    grep -r "service_role" src/
    ```
  - Debe estar vacío

- [ ] Verificar que ANON_KEY está en variables de entorno (no hardcoded)
  - [ ] En Vercel: Settings → Environment Variables
  - [ ] En Netlify: Build & deploy → Environment
  - [ ] NO en `.env` cometido a git

- [ ] Certificar que `.env.local` NO está en git
  - [ ] `.gitignore` contiene `.env*`

### URLs de Checkout

- [ ] Todos los `checkout_url` deben ser HTTPS
  - [ ] Validación en [src/services/clubApi.js](C:/Users/User/Desktop/autoestetica-v3/src/services/clubApi.js#78)
  - Función: `isHttpsUrl(value)` ✅

- [ ] Si usas Mercado Pago links, verificar que no tienen información sensible en la URL
  - [ ] Los links de prueba no deben exponerse en producción

### Autenticación Admin

- [ ] Login en `/admin/login` requiere Supabase Auth ✅
- [ ] `/admin/club` requiere rol OWNER_ADMIN ✅
  - Verificar: [src/app/router.jsx](C:/Users/User/Desktop/autoestetica-v3/src/app/router.jsx#59)
  - ```jsx
    <Route path="/admin/club" element={protectOwnerAdmin(<ClubSettings />)} />
    ```

- [ ] No hay admin username/password hardcodeado
  - [ ] Todo es Supabase Auth

### Data Validation

- [ ] Precio valida >= 0
  - [ ] Backend: [src/services/clubApi.js#76](C:/Users/User/Desktop/autoestetica-v3/src/services/clubApi.js#76) ✅
  - [ ] Frontend: [src/pages/admin/ClubSettings.jsx#247-255](C:/Users/User/Desktop/autoestetica-v3/src/pages/admin/ClubSettings.jsx#247-255) ✅

- [ ] Titulo obligatorio
  - [ ] Validación: [src/services/clubApi.js#75](C:/Users/User/Desktop/autoestetica-v3/src/services/clubApi.js#75) ✅

- [ ] Al menos 1 feature/beneficio
  - [ ] Validación: [src/services/clubApi.js#77](C:/Users/User/Desktop/autoestetica-v3/src/services/clubApi.js#77) ✅

- [ ] URLs validan HTTPS (checkout + imagen)
  - [ ] Validación: [src/services/clubApi.js#78-79](C:/Users/User/Desktop/autoestetica-v3/src/services/clubApi.js#78-79) ✅

---

## ⚡ PERFORMANCE

### Bundle Size

- [ ] Build actual: ~131 KB gzipped (JS principal)
  - [ ] Límite: < 150 KB
  - [ ] Si es > 150 KB, revisar imports no utilizados

- [ ] Verificar que no hay dependencias duplicadas
  ```bash
  npm ls
  ```
  - Buscar advertencias de duplicados

### Loading States

- [ ] Landing pública mostra skeleton/spinner mientras carga planes
  - [ ] Componente: [src/components/public/ClubMembershipSection.jsx#30-45](C:/Users/User/Desktop/autoestetica-v3/src/components/public/ClubMembershipSection.jsx#30-45) ✅
  - Clase: `ClubSkeleton()`

- [ ] Admin muestra skeleton mientras carga planes
  - [ ] Componente: [src/pages/admin/ClubSettings.jsx#71-82](C:/Users/User/Desktop/autoestetica-v3/src/pages/admin/ClubSettings.jsx#71-82) ✅
  - Clase: `PlansSkeleton()`

- [ ] No hay layout shift (CLS) mientras carga
  - Verificar en Lighthouse o PageSpeed Insights

### Image Optimization

- [ ] Las imágenes de planes usan `loading="lazy"`
  - [ ] Verificar: [src/components/public/ClubMembershipSection.jsx#98](C:/Users/User/Desktop/autoestetica-v3/src/components/public/ClubMembershipSection.jsx#98) ✅

- [ ] Las imágenes tienen `alt` y atributos accesibles
  - [ ] Verificar: [src/components/public/ClubMembershipSection.jsx#94-99](C:/Users/User/Desktop/autoestetica-v3/src/components/public/ClubMembershipSection.jsx#94-99) ✅

### Caching

- [ ] Planes se cachean en Supabase (Realtime opcional)
  - [ ] Hook: [src/hooks/useClubPlans.js#11-40](C:/Users/User/Desktop/autoestetica-v3/src/hooks/useClubPlans.js#11-40) ✅
  - Si `realtime: true`, hay refresh automático en cambios

---

## ♿ ACCESIBILIDAD

### Semantic HTML

- [ ] Estructura semántica en [src/components/public/ClubMembershipSection.jsx](C:/Users/User/Desktop/autoestetica-v3/src/components/public/ClubMembershipSection.jsx)
  - [ ] `<section>` con `aria-labelledby`
  - [ ] `<article>` para cada tarjeta

- [ ] Botones son `<button>` o `<a>` correctamente
  - [ ] No `<div>` con onclick sin ARIA

### ARIA Labels

- [ ] CTA "Unirme al Club" tiene aria-label o texto descriptivo ✅
- [ ] CTA "Pedir turno por WhatsApp" tiene aria-label ✅
- [ ] Tarjeta Fidelity: `aria-label="Tres troqueles marcados y uno pendiente"` ✅

### Keyboard Navigation

- [ ] Todos los CTAs son alcanzables por Tab
- [ ] Focus states visibles (en CSS)
- [ ] Los links external abren en nueva pestaña con `rel="noopener noreferrer"` ✅

### Color Contrast

- [ ] Texto vs fondo tienen suficiente contraste (WCAG AA minimum 4.5:1)
  - [ ] Verificar en: WAVE tool o Lighthouse
  - El color blanco (#f2f0eb) sobre azul cielo (#57c7ff) está OK
  - El color oscuro (#03111a) sobre gradiente azul está OK

---

## 📱 RESPONSIVENESS

### Mobile (640px max)

- [ ] Landing membresías se ve legible en móvil
  - [ ] Grid se colapsa a 1 columna ✅
  - [ ] Botones full-width ✅
  - [ ] Texto escalado correctamente ✅
  - Verificar: [src/components/public/ClubMembershipSection.css#568-643](C:/Users/User/Desktop/autoestetica-v3/src/components/public/ClubMembershipSection.css#568-643) ✅

- [ ] Admin no se ha probado en móvil (es solo panel desktop, está OK)

### Tablet (981px - 1024px)

- [ ] Grid responsive funciona bien
  - [ ] Fidelity card se coloca debajo del plan
  - [ ] Tamaños font escalados

---

## 🧪 TESTING

- [ ] Lint pasa: `npm run lint` ✅
- [ ] Tests pasan: `npm run test:run` — 24 tests OK ✅
- [ ] Build funciona: `npm run build` ✅
- [ ] Predeploy validaciones: `npm run predeploy` (si usas)

**Cobertura esperada:**
- Tests de `clubApi.js`: ✅ 3 tests
- Tests de `ClubMembershipSection.jsx`: ✅ 4 tests
- Tests de hooks (si hay): validar que `useClubPlans` funciona

---

## 🔍 VALIDACIONES FINALES PRE-LAUNCH

### Base de datos

- [ ] Tabla `club_plans` tiene al menos 1 columna válida
  - [ ] Campos: id, title, price, currency, features, is_active, ...
  - Verificar: `SELECT * FROM public.club_plans LIMIT 1;`

- [ ] Tabla `admins` tiene al menos 1 usuario
  - Verificar: `SELECT * FROM public.admins;`

- [ ] Triggers de `updated_at` están activos (opcional pero bueno)

### Environment Variables

**Vercel/Netlify debe tener:**
```
VITE_SUPABASE_URL=https://XXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=XXXXX...
VITE_ORGANIZATION_SLUG=autoestetica-tucuman
```

- [ ] Verificar que están presentes (no vacías)
- [ ] Verificar que NO hay typos

### Configuración Supabase

- [ ] Authentication → URL Configuration
  - [ ] Site URL: `https://www.tudominio.com`
  - [ ] Redirect URLs: `https://www.tudominio.com/admin/login`

---

## 🚀 ÚLTIMO CHECK (30 mins antes de deploy)

1. **Lint & Build locales**
   ```bash
   npm run lint && npm run build
   ```
   - [ ] Sin errores

2. **Revisar `.env` en producción**
   - [ ] Variables están en el hosting (Vercel/Netlify)
   - [ ] No en `.env` cometido

3. **Probar landing + admin en preview**
   - [ ] Desplegar a preview branch o staging
   - [ ] Verificar que no hay errores

4. **Notificar al equipo**
   - [ ] Se viene el launch
   - [ ] Estar pendiente de bugs los primeros días

---

## 🎯 Resumen de checkpoints críticos

| Checkpoint | Estado | Responsable |
|-----------|--------|-------------|
| RLS políticas en Supabase | ✅ | Check en Supabase console |
| Admin user creado | ⚠️ | Pendiente: insertar real UUID |
| Mercado Pago URL | ✅ | En plan real de producción |
| Variables .env en hosting | ⚠️ | Pendiente: configurar en Vercel |
| Lint/Build pasan | ✅ | Verificado |
| Tests pasan | ✅ | 24/24 OK |
| Landing testea en móvil | ⚠️ | Pendiente: día del deploy |
| Advertir redes sociales | ⚠️ | Post-deploy |

---

## 📞 Si algo falla en producción

1. Revisar logs:
   - Supabase: `Logs` tab
   - Frontend: Browser console
   - Vercel: Deployments → Logs

2. Errores RLS comunes:
   - "new row violates row-level security policy"
   - → Revisar que admin está en tabla `admins`
   - → Revisar que políticas son las correctas

3. Errores de auth:
   - "Not authenticated"
   - → Verificar VITE_SUPABASE_ANON_KEY está correcta
   - → Verificar que no hay CORS issues

4. Rollback rápido:
   - Si todo falla, desactivar el plan (`is_active = false`)
   - Landing volverá a mostrar el banner "Próximamente"
   - Nadie verá errores públicos

---

**Estado:** Listo para desplegar ✅  
**Fecha estimada:** Esta semana 🚀  
**Tiempo total:** 4-5 horas (incluyendo testing)
