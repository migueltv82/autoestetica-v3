import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../lib/supabase";
import { lookupPublicFidelityCard, lookupPublicFidelityCards } from "./publicFidelityApi";

vi.mock("../lib/supabase", () => ({ supabase: { rpc: vi.fn() } }));

describe("publicFidelityApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("consulta por token privado sin enviar solamente el teléfono", async () => {
    supabase.rpc.mockResolvedValue({ data: [{ card_id: "card-1", public_token: "token-1", client_name: "Ana", stamps_count: 2, total_stamps: 4, status: "active", vehicle_label: "Ford Ka", vehicle_type: "Auto", license_plate: "AA123BB", activated_at: "2026-08-05T12:00:00Z" }], error: null });
    const result = await lookupPublicFidelityCard({ token: "12345678-1234-4123-8123-123456789abc" });
    expect(supabase.rpc).toHaveBeenCalledWith("lookup_public_fidelity_card", {
      p_token: "12345678-1234-4123-8123-123456789abc", p_phone: null, p_access_code: null,
    });
    expect(result).toMatchObject({ id: "card-1", publicToken: "token-1", clientName: "Ana", stampsCount: 2, vehicle: "Ford Ka", vehicleType: "Auto", licensePlate: "AA123BB", activatedAt: "2026-08-05T12:00:00Z" });
  });

  it("normaliza teléfono y código para el acceso manual", async () => {
    supabase.rpc.mockResolvedValue({ data: [], error: null });
    await lookupPublicFidelityCard({ phone: "381 400-0000", accessCode: "ab12-cd34" });
    expect(supabase.rpc).toHaveBeenCalledWith("lookup_public_fidelity_card", {
      p_token: null, p_phone: "3814000000", p_access_code: "ab12cd34",
    });
  });

  it("devuelve todas las tarjetas habilitadas para elegir vehiculo", async () => {
    supabase.rpc.mockResolvedValue({
      data: [
        { card_id: "card-1", client_name: "Ana", vehicle_label: "Ford Ka" },
        { card_id: "card-2", client_name: "Ana", vehicle_label: "Toyota Hilux" },
      ],
      error: null,
    });

    const result = await lookupPublicFidelityCards({ token: "private-token" });
    expect(result).toHaveLength(2);
    expect(result.map((card) => card.vehicle)).toEqual(["Ford Ka", "Toyota Hilux"]);
  });
});
