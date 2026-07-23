import { describe, expect, it, vi } from "vitest";
import { buildTurnItems, buildTurnSchedule, mapWorkOrder, STATUS_TO_DB } from "./turnsApi";
import { turnOccupiesDate } from "../utils/date";

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe("turnsApi", () => {
  it("keeps the public status labels mapped to database values", () => {
    expect(STATUS_TO_DB).toMatchObject({
      Consulta: "inquiry",
      Pendiente: "pending",
      "Seña pendiente": "deposit_pending",
      Confirmado: "confirmed",
      "En proceso": "in_progress",
      Listo: "ready",
      Finalizado: "delivered",
      Cancelado: "cancelled",
      "No asistió": "no_show",
    });
  });

  it("builds schedule and service items from the turn form", () => {
    const formData = {
      date: "2026-07-18",
      time: "09:30",
      durationMinutes: 150,
      services: [
        { serviceId: "premium", name: "Lavado premium", price: "15000" },
        { name: "Aspirado", price: 5000 },
      ],
    };

    const { start, end } = buildTurnSchedule(formData);
    expect(start).toBe("2026-07-18T09:30:00-03:00");
    expect(end.toISOString()).toBe("2026-07-18T15:00:00.000Z");
    expect(buildTurnItems(formData)).toEqual([
      { serviceId: "premium", name: "Lavado premium", price: 15000 },
      { serviceId: null, name: "Aspirado", price: 5000 },
    ]);
  });

  it("maps work orders into agenda turns", () => {
    const turn = mapWorkOrder({
      id: "order-id",
      number: 12,
      client_id: "client-id",
      vehicle_id: "vehicle-id",
      status: "confirmed",
      scheduled_start: "2026-07-18T12:30:00.000Z",
      scheduled_end: "2026-07-18T15:00:00.000Z",
      notes: "Sin perfume",
      total: "20000",
      clients: { name: "Carlos", phone: "5493811234567" },
      vehicles: { type: "Camioneta" },
      work_order_items: [{ description: "Lavado premium", total: 20000 }],
    });

    expect(turn).toMatchObject({
      id: "order-id",
      number: 12,
      client: "Carlos",
      phone: "5493811234567",
      vehicle: "Camioneta",
      service: "Lavado premium",
      status: "Confirmado",
      notes: "Sin perfume",
      amount: 20000,
      durationMinutes: 150,
    });
  });

  it("supports multi-day work periods and marks every occupied agenda date", () => {
    const { start, end } = buildTurnSchedule({
      date: "2026-07-18",
      time: "09:00",
      endDate: "2026-07-20",
      endTime: "18:00",
    });
    expect(start).toBe("2026-07-18T09:00:00-03:00");
    expect(end.toISOString()).toBe("2026-07-20T21:00:00.000Z");
    const turn = { date: "2026-07-18", endDate: "2026-07-20", lastOccupiedDate: "2026-07-20" };
    expect(turnOccupiesDate(turn, "2026-07-18")).toBe(true);
    expect(turnOccupiesDate(turn, "2026-07-19")).toBe(true);
    expect(turnOccupiesDate(turn, "2026-07-20")).toBe(true);
    expect(turnOccupiesDate(turn, "2026-07-21")).toBe(false);
  });
});
