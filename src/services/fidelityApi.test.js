import { describe, expect, it, vi } from "vitest";
import { mapFidelityCard, stampFidelityCardForClient } from "./fidelityApi";
import { supabase } from "../lib/supabase";

vi.mock("../lib/supabase", () => ({
  supabase: { rpc: vi.fn(), from: vi.fn() },
}));

describe("fidelityApi helper functions", () => {
  it("mapea correctamente una fila de base de datos a objeto Tarjeta Fidelity", () => {
    const row = {
      id: "card-123",
      client_id: "client-abc",
      vehicle_id: "vehicle-xyz",
      stamps_count: 3,
      total_stamps: 4,
      status: "active",
      reward_description: "5° Lavado Premium Gratis",
      total_rewards_redeemed: 1,
      created_at: "2026-07-24T00:00:00Z",
      updated_at: "2026-07-24T00:00:00Z",
      clients: {
        id: "client-abc",
        name: "Juan Pérez",
        phone: "3815551234",
      },
      vehicles: { id: "vehicle-xyz", type: "Auto", brand: "Toyota", model: "Corolla", license_plate: "AA123BB" },
    };

    const result = mapFidelityCard(row);
    expect(result).toEqual({
      id: "card-123",
      clientId: "client-abc",
      vehicleId: "vehicle-xyz",
      stampsCount: 3,
      totalStamps: 4,
      status: "active",
      rewardDescription: "5° Lavado Premium Gratis",
      totalRewardsRedeemed: 1,
      createdAt: "2026-07-24T00:00:00Z",
      updatedAt: "2026-07-24T00:00:00Z",
      client: {
        id: "client-abc",
        name: "Juan Pérez",
        phone: "3815551234",
      },
      vehicle: { id: "vehicle-xyz", type: "Auto", brand: "Toyota", model: "Corolla", licensePlate: "AA123BB" },
    });
  });

  it("retorna null si la fila enviada a mapFidelityCard es nula", () => {
    expect(mapFidelityCard(null)).toBeNull();
  });

  it("registra el troquel automático mediante la operación atómica", async () => {
    supabase.rpc.mockResolvedValueOnce({
      data: {
        card: { id: "card-123", client_id: "client-abc", vehicle_id: "vehicle-xyz", stamps_count: 4, total_stamps: 4, status: "reward_ready" },
        newlyUnlocked: true,
        alreadyUnlocked: false,
      },
      error: null,
    });

    const result = await stampFidelityCardForClient("client-abc", "vehicle-xyz", "order-1", "Vehículo entregado");

    expect(supabase.rpc).toHaveBeenCalledWith("record_fidelity_stamp", {
      p_order_id: "order-1",
      p_notes: "Vehículo entregado",
    });
    expect(result).toMatchObject({ newlyUnlocked: true, alreadyUnlocked: false, card: { id: "card-123", stampsCount: 4 } });
  });
});
