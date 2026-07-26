-- Configuración editable de la sección "Deslizá y descubrí" en la página de inicio.
alter table public.business_settings
  add column if not exists transformation_title text,
  add column if not exists transformation_subtitle text,
  add column if not exists transformation_service_label text,
  add column if not exists transformation_before_path text,
  add column if not exists transformation_after_path text;

comment on column public.business_settings.transformation_title is 'Título público de la sección antes/después del inicio.';
comment on column public.business_settings.transformation_subtitle is 'Texto de apoyo de la sección antes/después del inicio.';
comment on column public.business_settings.transformation_service_label is 'Etiqueta mostrada debajo del slider antes/después.';
comment on column public.business_settings.transformation_before_path is 'Ruta en Storage bucket portfolio de la foto del antes.';
comment on column public.business_settings.transformation_after_path is 'Ruta en Storage bucket portfolio de la foto del después.';
