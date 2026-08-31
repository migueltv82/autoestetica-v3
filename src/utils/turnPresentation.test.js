import { describe, expect, it } from "vitest";
import { getTurnStatusClass, getTurnVehicleLabel } from "./turnPresentation";
import { getServiceTone } from "./serviceTone";

describe("presentación compartida de turnos", () => {
  it("arma el vehículo sin separadores vacíos", () => {
    expect(getTurnVehicleLabel({ vehicle: "Auto", vehicleBrand: "Ford", vehicleModel: "Focus" })).toBe("Auto · Ford · Focus");
    expect(getTurnVehicleLabel({ vehicleBrand: "Toyota", vehicleModel: "Hilux" })).toBe("Toyota · Hilux");
    expect(getTurnVehicleLabel({})).toBe("");
  });

  it("normaliza estados para las clases CSS", () => {
    expect(getTurnStatusClass("En proceso")).toBe("en-proceso");
    expect(getTurnStatusClass()).toBe("sin-estado");
  });

  it("mantiene una categoría visual consistente por servicio", () => {
    expect(getServiceTone({ service: "Lavado premium" })).toBe("service-gold");
    expect(getServiceTone({ service: "Lavado de bicicleta" })).toBe("service-violet");
    expect(getServiceTone({ service: "Lavado de moto" })).toBe("service-turquoise");
    expect(getServiceTone({ services: [{}, {}], service: "Lavado premium" })).toBe("service-combined");
  });
});
