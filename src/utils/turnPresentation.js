/** Presentación compartida por todas las vistas de agenda. */
export function getTurnVehicleLabel(turn) {
  return [turn?.vehicle, turn?.vehicleBrand, turn?.vehicleModel].filter(Boolean).join(" · ");
}

export function getTurnStatusClass(status) {
  return String(status || "sin-estado").toLowerCase().replaceAll(" ", "-");
}
