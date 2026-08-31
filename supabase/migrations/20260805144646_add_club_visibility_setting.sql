-- Permite publicar u ocultar el Club desde la configuración del negocio.
alter table public.business_settings
  add column if not exists club_section_enabled boolean not null default true;

comment on column public.business_settings.club_section_enabled is
  'Controla si la sección Club Autoestética Tucumán se muestra en el sitio público.';
