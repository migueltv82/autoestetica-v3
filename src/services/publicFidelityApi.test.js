import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../lib/supabase";
import { lookupPublicFidelityCard } from "./publicFidelityApi";

vi.mock("../lib/supabase", () => ({ supabase: { rpc: vi.fn() } }));

describe("publicFidelityApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("consulta por token privado sin enviar solamente el teléfono", async () => {
    supabase.rpc.mockResolvedValue({ data: [{ client_name: "Ana", stamps_count: 2, total_stamps: 4, status: "active", vehicle_label: "Ford Ka" }], error: null });
    const result = await lookupPublicFidelityCard({ token: "12345678-1234-4123-8123-123456789abc" });
    expect(supabase.rpc).toHaveBeenCalledWith("lookup_public_fidelity_card", {
      p_token: "12345678-1234-4123-8123-123456789abc", p_phone: null, p_access_code: null,
    });
    expect(result).toMatchObject({ clientName: "Ana", stampsCount: 2, vehicle: "Ford Ka" });
  });

  it("normaliza teléfono y código para el acceso manual", async () => {
    supabase.rpc.mockResolvedValue({ data: [], error: null });
    await lookupPublicFidelityCard({ phone: "381 400-0000", accessCode: "ab12-cd34" });
    expect(supabase.rpc).toHaveBeenCalledWith("lookup_public_fidelity_card", {
      p_token: null, p_phone: "3814000000", p_access_code: "ab12cd34",
    });
  });
});
