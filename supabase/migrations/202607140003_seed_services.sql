-- Catálogo inicial de Autoestética Tucumán.
-- Los precios quedan ocultos hasta que se definan desde el administrador.
with target_org as (
  select id from public.organizations where slug = 'autoestetica-tucuman' limit 1
), catalog(name, description, duration_label, icon_name, featured, sort_order) as (
  values
    ('Lavado Premium', 'Lavado exterior detallado, limpieza de llantas, aspirado interior y terminación cuidada para recuperar la presencia del vehículo.', '2 a 3 horas', 'Sparkles', true, 1),
    ('Limpieza de Interior', 'Limpieza profunda de tapizados, alfombras, plásticos y superficies interiores con productos específicos para cada material.', '4 a 6 horas', 'Droplets', true, 2),
    ('Abrillantado', 'Proceso de realce de brillo para mejorar la terminación de la pintura y reducir marcas superficiales.', '4 a 6 horas', 'Sparkles', true, 3),
    ('Tratamiento Acrílico / Cerámico', 'Preparación de la pintura y aplicación de una protección de larga duración que aporta brillo y facilita el mantenimiento.', '1 a 2 días', 'ShieldCheck', true, 4),
    ('Lavado de Bicicletas', 'Limpieza detallada de cuadro, ruedas y componentes con cuidado especial de transmisión, frenos y terminaciones.', '1 a 2 horas', 'Bike', false, 5),
    ('Lavado de Motos', 'Lavado detallado de carrocería, motor, ruedas y zonas de difícil acceso con terminación segura para cada superficie.', '2 a 3 horas', 'Bike', false, 6)
)
insert into public.services (
  organization_id, name, description, base_price, duration_label, icon_name,
  featured, active, public_visible, display
)
select
  target_org.id, catalog.name, catalog.description, 0, catalog.duration_label,
  catalog.icon_name, catalog.featured, true, true,
  jsonb_build_object('name',true,'description',true,'gallery',true,'duration',true,'price',false,'sortOrder',catalog.sort_order)
from target_org cross join catalog
where not exists (
  select 1 from public.services existing
  where existing.organization_id = target_org.id
    and lower(existing.name) = lower(catalog.name)
    and existing.deleted_at is null
);
