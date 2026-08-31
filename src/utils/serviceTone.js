/**
 * Devuelve la clase visual asociada a un servicio de agenda.
 * Los turnos combinados tienen prioridad sobre las categorías individuales.
 */
export function getServiceTone(turn) {
  const name = String(turn?.service || "").toLowerCase();
  if ((turn?.services?.length || 0) > 1 || /combin|combo|\+/.test(name)) return "service-combined";
  if (/bicicleta|\bbici\b/.test(name)) return "service-violet";
  if (/\bmoto\b|motocicleta/.test(name)) return "service-turquoise";
  if (/lavado premium/.test(name)) return "service-gold";
  if (/interior/.test(name)) return "service-green";
  if (/abrillant/.test(name)) return "service-blue";
  if (/tratamiento/.test(name)) return "service-gray";
  return "service-neutral";
}
