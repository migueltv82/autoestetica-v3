/** Presentación compartida por todas las vistas de agenda. */
export function getTurnVehicleLabel(turn) {
  return [turn?.vehicle, turn?.vehicleBrand, turn?.vehicleModel].filter(Boolean).join(" · ");
}

export function getTurnStatusClass(status) {
  return String(status || "sin-estado").toLowerCase().replaceAll(" ", "-");
}

/** Props para hacer clickeable/accesible una tarjeta de turno, sin interceptar sus controles internos. */
export function getTurnCardInteractionProps(turn, onView) {
  const isInteractiveTarget = (event) => event.target.closest("a,button,select");
  return {
    role: "button",
    tabIndex: 0,
    onClick: (event) => { if (!isInteractiveTarget(event)) onView?.(turn); },
    onKeyDown: (event) => { if (!isInteractiveTarget(event) && (event.key === "Enter" || event.key === " ")) onView?.(turn); },
  };
}
