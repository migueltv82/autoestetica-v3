export function normalizeArgentinaPhone(value) {
  let phone = String(value || "").replace(/\D/g, "").replace(/^0/, "");
  if (phone.startsWith("54")) return phone.startsWith("549") ? phone : `549${phone.slice(2).replace(/^15/, "")}`;
  return `549${phone.replace(/^15/, "")}`;
}

export function normalizeStoredArgentinaPhone(value) {
  let phone = String(value || "").replace(/\D/g, "").replace(/^0+/, "");
  if (phone.startsWith("549")) phone = phone.slice(3);
  else if (phone.startsWith("54")) phone = phone.slice(2).replace(/^9/, "");
  return phone.replace(/^15/, "");
}

function displayDate(date) {
  if (!date) return "";
  return new Date(`${date}T12:00:00`).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

export function appointmentWhatsAppLink(turn, businessName = "Autoestética Tucumán") {
  const phone = normalizeArgentinaPhone(turn.phone);
  const schedule = `${displayDate(turn.date)} a las ${turn.time}`;
  let text;
  if (turn.status === "Listo") {
    text = `Hola ${turn.client} 👋 Tu ${turn.vehicle.toLowerCase()} ya está listo para retirar en ${businessName}. Servicios realizados: ${turn.service}.`;
  } else if (["Consulta", "Pendiente", "Seña pendiente"].includes(turn.status)) {
    text = `Hola ${turn.client} 👋 Te escribimos de ${businessName} para confirmar tu turno del ${schedule}, para tu ${turn.vehicle.toLowerCase()}. Servicios: ${turn.service}. ¿Podés confirmarnos tu asistencia?`;
  } else {
    text = `Hola ${turn.client} 👋 Te recordamos tu turno en ${businessName} para el ${schedule}. Vehículo: ${turn.vehicle}. Servicios: ${turn.service}. ¡Te esperamos!`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function clientWhatsAppLink(client, businessName = "Autoestética Tucumán") {
  const text = `Hola ${client.name} 👋 Te escribimos de ${businessName}.`;
  return `https://wa.me/${normalizeArgentinaPhone(client.phone)}?text=${encodeURIComponent(text)}`;
}

export function turnConfirmationWhatsAppLink(turn, businessName = "Autoestética Tucumán", template = "") {
  const schedule = `${displayDate(turn.date)} a las ${turn.time}`;
  const vehicle = String(turn.vehicle || "vehículo").toLowerCase();
  const text = template ? String(template)
    .replaceAll("{cliente}", turn.client || "cliente")
    .replaceAll("{negocio}", businessName)
    .replaceAll("{fecha}", displayDate(turn.date))
    .replaceAll("{hora}", turn.time || "")
    .replaceAll("{vehiculo}", vehicle)
    .replaceAll("{servicios}", turn.service || "")
    : `Hola ${turn.client} 👋 Te escribimos de ${businessName} para confirmar tu turno del ${schedule}, para tu ${vehicle}. Servicios: ${turn.service}. ¿Podés confirmarnos tu asistencia?`;
  return `https://wa.me/${normalizeArgentinaPhone(turn.phone)}?text=${encodeURIComponent(text)}`;
}

export function readyVehicleWhatsAppLink(client, template, openingHours) {
  const vehicle = client.vehicles?.[0];
  const vehicleLabel = [vehicle?.brand, vehicle?.model].filter(Boolean).join(" ") || vehicle?.type || client.vehicle || "vehículo";
  const text = String(template || "")
    .replaceAll("{cliente}", client.name || "cliente")
    .replaceAll("{vehiculo}", vehicleLabel)
    .replaceAll("{horario}", openingHours || "de 9:00 a 17:00");
  return `https://wa.me/${normalizeArgentinaPhone(client.phone)}?text=${encodeURIComponent(text)}`;
}

export function readyTurnWhatsAppLink(turn, template, openingHours) {
  const text = String(template || "Hola {cliente}, queremos informarte que tu {vehiculo} ya está listo para retirar. Nuestro horario de atención es {horario}.")
    .replaceAll("{cliente}", turn.client || "cliente")
    .replaceAll("{vehiculo}", String(turn.vehicle || "vehículo").toLowerCase())
    .replaceAll("{horario}", openingHours || "de 9:00 a 17:00");
  return `https://wa.me/${normalizeArgentinaPhone(turn.phone)}?text=${encodeURIComponent(text)}`;
}
