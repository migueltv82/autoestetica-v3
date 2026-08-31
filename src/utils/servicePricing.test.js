import { describe, expect, it } from "vitest";
import { getServicePriceForVehicle } from "./servicePricing";

describe("getServicePriceForVehicle", () => {
  const hiddenPriceService = {
    name: "Lavado Premium",
    carPrice: 15000,
    truckPrice: 22000,
    priceOnRequest: true,
    display: { price: false },
  };

  it("keeps the internal car price active when the public price is hidden", () => {
    expect(getServicePriceForVehicle(hiddenPriceService, "Auto")).toBe(15000);
  });

  it("keeps the internal truck price active when the public price is hidden", () => {
    expect(getServicePriceForVehicle(hiddenPriceService, "Camioneta")).toBe(22000);
    expect(getServicePriceForVehicle(hiddenPriceService, "SUV")).toBe(22000);
  });
});
