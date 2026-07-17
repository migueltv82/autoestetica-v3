alter table public.business_settings
add column if not exists ready_message_template text;

update public.business_settings
set ready_message_template = 'Hola {cliente}, queremos informarte que tu {vehiculo} ya está listo para retirar. Por favor, recordá que nuestro horario de atención es {horario}. Ante cualquier inconveniente, comunicate con nosotros.'
where ready_message_template is null;

