import { describe, expect, it } from "vitest";
import { mapFidelityCard } from "./fidelityApi";

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
});
