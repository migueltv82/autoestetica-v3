alter table public.business_settings
add column if not exists confirmation_message_template text;

update public.business_settings
set confirmation_message_template = 'Hola {cliente} 👋 Te escribimos de {negocio} para confirmar tu turno del {fecha} a las {hora}, para tu {vehiculo}. Servicios: {servicios}. ¿Podés confirmarnos tu asistencia?'
where confirmation_message_template is null;

