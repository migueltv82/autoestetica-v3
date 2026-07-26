import { describe, expect, it, vi } from "vitest";
import { buildClubPlanPayload, DEFAULT_CLUB_PLAN, isHttpsUrl, mapClubPlan, validateClubPlan } from "./clubApi";

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

describe("clubApi", () => {
  it("maps club plans from database rows", () => {
    const mapped = mapClubPlan({
      id: "plan-id",
      title: "Club Autoestética Premium",
      subtitle: "Cuidado recurrente",
      price: "25000",
      currency: "ARS",
      features: ["Prioridad", "Descuento"],
      checkout_url: "https://mp.test/club",
      fidelity_card_active: true,
      is_active: true,
      image_url: "https://cdn.test/club.webp",
      created_at: "2026-07-19T10:00:00Z",
      updated_at: "2026-07-19T11:00:00Z",
      updated_by: "user-id",
    });

    expect(mapped).toEqual({
      id: "plan-id",
      title: "Club Autoestética Premium",
      subtitle: "Cuidado recurrente",
      price: 25000,
      currency: "ARS",
      features: ["Prioridad", "Descuento"],
      checkoutUrl: "https://mp.test/club",
      fidelityCardActive: true,
      isActive: true,
      imageUrl: "https://cdn.test/club.webp",
      createdAt: "2026-07-19T10:00:00Z",
      updatedAt: "2026-07-19T11:00:00Z",
      updatedBy: "user-id",
    });
  });

  it("builds a normalized upsert payload", () => {
    const payload = buildClubPlanPayload({
      id: "plan-id",
      title: " Club Premium ",
      subtitle: " Beneficios ",
      price: "-100",
      currency: " ars ",
      features: [" Prioridad ", "", " Fidelity "],
      checkoutUrl: " https://mp.test/club ",
      fidelityCardActive: true,
      isActive: true,
      imageUrl: "",
    });

    expect(payload).toEqual({
      id: "plan-id",
      title: "Club Premium",
      subtitle: "Beneficios",
      price: 0,
      currency: "ARS",
      features: ["Prioridad", "Fidelity"],
      checkout_url: "https://mp.test/club",
      fidelity_card_active: true,
      is_active: true,
      image_url: null,
    });
  });

  it("validates https URLs and required commercial fields", () => {
    expect(isHttpsUrl("https://mp.test/club")).toBe(true);
    expect(isHttpsUrl("http://mp.test/club")).toBe(false);
    expect(validateClubPlan({ ...DEFAULT_CLUB_PLAN, title: "", features: [], checkoutUrl: "http://test" })).toEqual([
      "El título del plan es obligatorio.",
      "Cargá al menos un ítem incluido en el plan.",
      "La URL de Mercado Pago debe empezar con https://.",
    ]);
  });
});
