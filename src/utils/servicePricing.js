export function isTwoWheelService(serviceOrName) {
  const name = typeof serviceOrName === "string" ? serviceOrName : serviceOrName?.name;
  return /\b(moto|motos|bicicleta|bicicletas|bici|bicis)\b/i.test(name || "");
}

export function getServicePriceForVehicle(service, vehicle) {
  if (!service) return 0;
  if (isTwoWheelService(service)) return Number(service.carPrice || 0);
  return ["Camioneta", "SUV"].includes(vehicle)
    ? Number(service.truckPrice || 0)
    : Number(service.carPrice || 0);
}
