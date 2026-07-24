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

export function getBaseSiteUrl() {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return "https://www.autoesteticatucuman.com.ar";
}

export function appointmentWhatsAppLink(turn, businessName = "Autoestética Tucumán") {
  const phone = normalizeArgentinaPhone(turn.phone);
  const rawPhone = normalizeStoredArgentinaPhone(turn.phone);
  const schedule = `${displayDate(turn.date)} a las ${turn.time}`;
  const cardUrl = `${getBaseSiteUrl()}/tarjeta?phone=${rawPhone}`;

  let text;
  if (turn.status === "Listo") {
    text = `Hola ${turn.client} 👋 Tu ${turn.vehicle.toLowerCase()} ya está listo para retirar en ${businessName}. Servicios realizados: ${turn.service}.\n\n💳 Revisá tus sellos cargados en tu Tarjeta Fidelity Pass:\n👉 ${cardUrl}`;
  } else if (["Consulta", "Pendiente", "Seña pendiente"].includes(turn.status)) {
    text = `Hola ${turn.client} 👋 Te escribimos de ${businessName} para coordinar tu turno del ${schedule}, para tu ${turn.vehicle.toLowerCase()}. Servicios: ${turn.service}.\n\n🎁 Recordá que con cada servicio sumás sellos en tu Tarjeta Fidelity Pass digital:\n👉 ${cardUrl}\n\n¿Podés confirmarnos tu asistencia?`;
  } else {
    text = `Hola ${turn.client} 👋 ¡Tu turno en ${businessName} está CONFIRMADO para el ${schedule}! (${turn.vehicle} - ${turn.service}).\n\n🎁 Con este turno activás tu Tarjeta Fidelity Pass digital:\n👉 ${cardUrl}\n\n¿Cómo funciona?\n1. En cada visita sellamos tu tarjeta digital.\n2. Al completar 4 troqueles, ¡tu 5° Lavado Premium es 100% GRATIS!`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function clientWhatsAppLink(client, businessName = "Autoestética Tucumán") {
  const rawPhone = normalizeStoredArgentinaPhone(client.phone);
  const cardUrl = `${getBaseSiteUrl()}/tarjeta?phone=${rawPhone}`;
  const text = `Hola ${client.name} 👋 Te escribimos de ${businessName}.\n\n💳 Acá podés consultar tu Tarjeta Fidelity Pass digital:\n👉 ${cardUrl}`;
  return `https://wa.me/${normalizeArgentinaPhone(client.phone)}?text=${encodeURIComponent(text)}`;
}

export function fidelityWelcomeWhatsAppLink(turn, businessName = "Autoestética Tucumán") {
  const rawPhone = normalizeStoredArgentinaPhone(turn.phone);
  const cardUrl = `${getBaseSiteUrl()}/clientes?telefono=${rawPhone}`;
  const text = `Hola ${turn.client} 👋 Tu turno en ${businessName} quedó confirmado y ya tenés tu Tarjeta Fidelity digital.\n\n¿Cómo funciona?\n• Cada vez que retires un trabajo terminado sumás 1 sello.\n• Al completar 4 sellos desbloqueás tu beneficio.\n• Podés consultar tu progreso cuando quieras desde este enlace:\n${cardUrl}`;
  return `https://wa.me/${normalizeArgentinaPhone(turn.phone)}?text=${encodeURIComponent(text)}`;
}

export function turnConfirmationWhatsAppLink(turn, businessName = "Autoestética Tucumán", template = "") {
  const schedule = `${displayDate(turn.date)} a las ${turn.time}`;
  const vehicle = String(turn.vehicle || "vehículo").toLowerCase();
  const rawPhone = normalizeStoredArgentinaPhone(turn.phone);
  const cardUrl = `${getBaseSiteUrl()}/tarjeta?phone=${rawPhone}`;

  const text = template ? String(template)
    .replaceAll("{cliente}", turn.client || "cliente")
    .replaceAll("{negocio}", businessName)
    .replaceAll("{fecha}", displayDate(turn.date))
    .replaceAll("{hora}", turn.time || "")
    .replaceAll("{vehiculo}", vehicle)
    .replaceAll("{servicios}", turn.service || "")
    .replaceAll("{tarjeta}", cardUrl)
    : `Hola ${turn.client} 👋 ¡Tu turno en ${businessName} está CONFIRMADO para el ${schedule}! (${vehicle} - ${turn.service}).\n\n🎁 Te damos la bienvenida a tu Tarjeta Fidelity Pass digital:\n👉 ${cardUrl}\n\n¿Cómo funciona?\n1. En cada visita al taller sellamos tu tarjeta digital.\n2. Al completar 4 troqueles, ¡tu 5° Lavado Premium es 100% GRATIS!`;

  return `https://wa.me/${normalizeArgentinaPhone(turn.phone)}?text=${encodeURIComponent(text)}`;
}

export function readyVehicleWhatsAppLink(client, template, openingHours) {
  const vehicle = client.vehicles?.[0];
  const vehicleLabel = [vehicle?.brand, vehicle?.model].filter(Boolean).join(" ") || vehicle?.type || client.vehicle || "vehículo";
  const rawPhone = normalizeStoredArgentinaPhone(client.phone);
  const cardUrl = `${getBaseSiteUrl()}/tarjeta?phone=${rawPhone}`;

  const text = String(template || "Hola {cliente}, queremos informarte que tu {vehiculo} ya está listo para retirar en nuestro taller. Nuestro horario es {horario}.\n\n💳 Ver tu Tarjeta Fidelity Pass: {tarjeta}")
    .replaceAll("{cliente}", client.name || "cliente")
    .replaceAll("{vehiculo}", vehicleLabel)
    .replaceAll("{horario}", openingHours || "de 9:00 a 17:00")
    .replaceAll("{tarjeta}", cardUrl);

  return `https://wa.me/${normalizeArgentinaPhone(client.phone)}?text=${encodeURIComponent(text)}`;
}

export function readyTurnWhatsAppLink(turn, template, openingHours) {
  const rawPhone = normalizeStoredArgentinaPhone(turn.phone);
  const cardUrl = `${getBaseSiteUrl()}/tarjeta?phone=${rawPhone}`;

  const text = String(template || "Hola {cliente}, queremos informarte que tu {vehiculo} ya está listo para retirar en Autoestética Tucumán. Nuestro horario de atención es {horario}.\n\n💳 Ver tu Tarjeta Fidelity Pass: {tarjeta}")
    .replaceAll("{cliente}", turn.client || "cliente")
    .replaceAll("{vehiculo}", String(turn.vehicle || "vehículo").toLowerCase())
    .replaceAll("{horario}", openingHours || "de 9:00 a 17:00")
    .replaceAll("{tarjeta}", cardUrl);

  return `https://wa.me/${normalizeArgentinaPhone(turn.phone)}?text=${encodeURIComponent(text)}`;
}
