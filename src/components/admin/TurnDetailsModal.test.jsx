import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TurnDetailsModal from "./TurnDetailsModal";

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }) => children,
  motion: new Proxy({}, { get: (_, tag) => tag }),
}));

const turn = {
  id: "turn-1",
  status: "Confirmado",
  service: "Lavado premium",
  client: "Benjamín Zubiaurre",
  phone: "5493810000000",
  vehicle: "Auto",
  vehicleBrand: "Ford",
  vehicleModel: "Focus",
  date: "2026-07-27",
  time: "09:00",
  endTime: "11:00",
  amount: 25000,
};

describe("TurnDetailsModal", () => {
  it("muestra la ficha completa del turno y la marca/modelo como subtítulo", () => {
    render(<TurnDetailsModal turn={turn} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Ford Focus")).toBeInTheDocument();
    expect(screen.getByText("Auto · Ford · Focus")).toBeInTheDocument();
    expect(screen.getByText("Benjamín Zubiaurre")).toBeInTheDocument();
  });

  it("cierra el modal antes de abrir la edición", () => {
    const onClose = vi.fn();
    const onEdit = vi.fn();
    render(<TurnDetailsModal turn={turn} onClose={onClose} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onEdit).toHaveBeenCalledWith(turn);
  });
});
