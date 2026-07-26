import { describe, expect, it, vi } from "vitest";
import { buildServicePayload, mapService } from "./servicesApi";

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    storage: { from: vi.fn() },
  },
}));

vi.mock("../lib/organization", () => ({
  getPublicOrganizationId: vi.fn(),
}));

describe("servicesApi", () => {
  it("maps service pricing, visibility and display data from database rows", () => {
    const mapped = mapService({
      id: "service-id",
      name: "Abrillantado",
      description: null,
      base_price: 12000,
      duration_label: null,
      estimated_minutes: 180,
      icon_name: null,
      cover_image_url: null,
      featured: true,
      active: true,
      public_visible: false,
      display: { carPrice: 14000, truckPrice: 18000, priceOnRequest: true, gallery: false },
      gallery: [{ url: "/work.webp" }],
    });

    expect(mapped).toMatchObject({
      id: "service-id",
      name: "Abrillantado",
      price: 12000,
      carPrice: 14000,
      truckPrice: 18000,
      priceOnRequest: true,
      duration: "180 min",
      iconName: "Zap",
      featured: true,
      active: true,
      publicVisible: false,
    });
    expect(mapped.display).toMatchObject({ name: true, gallery: false, price: true });
    expect(mapped.gallery).toHaveLength(1);
  });

  it("builds a normalized payload for Supabase", () => {
    const payload = buildServicePayload({
      name: " Lavado premium ",
      description: "",
      category: " Exterior ",
      carPrice: "15000",
      truckPrice: "22000",
      duration: "2 horas",
      durationMinutes: "10",
      iconName: "",
      coverImageUrl: "",
      featured: true,
      active: true,
      publicVisible: true,
      display: { price: false },
      priceOnRequest: false,
      gallery: [],
    }, "org-id");

    expect(payload).toMatchObject({
      organization_id: "org-id",
      name: "Lavado premium",
      description: null,
      category: "Exterior",
      base_price: 15000,
      duration_label: "2 horas",
      estimated_minutes: 15,
      icon_name: "Zap",
      cover_image_url: null,
      featured: true,
      active: true,
      public_visible: true,
    });
    expect(payload.display).toMatchObject({ price: false, carPrice: 15000, truckPrice: 22000, priceOnRequest: false });
  });
});
