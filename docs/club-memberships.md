# Club de Usuarios / Membresías

## Variables necesarias

El cliente Vite solo debe usar claves públicas:

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA_ANON
VITE_ORGANIZATION_SLUG=autoestetica-tucuman
```

No incluir `SERVICE_ROLE_KEY` en React/Vite. Esa clave solo puede vivir en Supabase Edge Functions o backend seguro.

## Migración

Ejecutar en Supabase SQL Editor:

```sql
-- Archivo:
-- supabase/migrations/202607190001_club_plans.sql
```

Crea:

- `public.admins`
- `public.club_plans`
- RLS
- policies públicas de lectura
- policies privadas de escritura para usuarios incluidos en `admins`
- trigger `updated_at` / `updated_by`
- seed demo

## Crear admin real

El seed incluye un UUID de ejemplo. En producción hay que cargar el `auth.uid()` real del usuario que va a administrar el Club.

Ejemplo:

```sql
insert into public.admins (user_id)
values ('REEMPLAZAR_POR_AUTH_UID_REAL')
on conflict (user_id) do nothing;
```

Para saber el `auth.uid()` real, podés verlo en Supabase Auth > Users.

## Query pública de landing

```sql
select *
from public.club_plans
where is_active = true
order by created_at desc;
```

## Upsert admin de ejemplo

```sql
insert into public.club_plans (
  title,
  subtitle,
  price,
  currency,
  features,
  checkout_url,
  fidelity_card_active,
  is_active
) values (
  'Club Autoestética Premium',
  'Cuidado recurrente para clientes exigentes.',
  25000,
  'ARS',
  array['Prioridad para turnos', 'Precio preferencial', 'Tarjeta Fidelity'],
  'https://www.mercadopago.com.ar/...',
  true,
  true
)
on conflict (id) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  price = excluded.price,
  currency = excluded.currency,
  features = excluded.features,
  checkout_url = excluded.checkout_url,
  fidelity_card_active = excluded.fidelity_card_active,
  is_active = excluded.is_active;
```

## Checkout y pagos

La URL `checkout_url` puede cargarse manualmente al principio.

Para una versión más robusta:

1. Crear una Supabase Edge Function que use `SERVICE_ROLE_KEY` y credenciales privadas de Mercado Pago.
2. Generar preferencias/suscripciones desde esa función.
3. Guardar el `checkout_url` resultante en `club_plans`.
4. Recibir webhooks de Mercado Pago en otra Edge Function.
5. Registrar estados de pago en una tabla privada, por ejemplo `club_memberships` o `club_payments`.

## Pruebas básicas post-deploy

1. Con el Club sin planes activos, la home debe mostrar “Próximamente”.
2. Agregar tu `auth.uid()` a `public.admins`.
3. Entrar a `/admin/club`.
4. Crear un plan con título, precio, al menos un beneficio y URL `https://`.
5. Activar `is_active`.
6. Volver a la home y verificar que aparece el plan.
7. Si `checkout_url` está vacío, el botón “Unirme al Club” debe quedar deshabilitado.
8. Si `fidelity_card_active` está activo, debe mostrarse la Tarjeta Fidelity con botón de WhatsApp.
