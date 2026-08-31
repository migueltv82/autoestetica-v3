import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import ResetPassword from "./ResetPassword";

vi.mock("../../hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../lib/supabase", () => ({ supabase: { auth: { updateUser: vi.fn() } } }));

function renderPage(authState) {
  useAuth.mockReturnValue(authState);
  return render(<MemoryRouter initialEntries={["/admin/restablecer-clave"]}><Routes>
    <Route path="/admin/restablecer-clave" element={<ResetPassword />} />
    <Route path="/admin/login" element={<div>Inicio de sesión</div>} />
  </Routes></MemoryRouter>);
}

describe("ResetPassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rechaza enlaces vencidos sin sesión de recuperación", () => {
    renderPage({ user: null, isLoading: false, signOut: vi.fn() });
    expect(screen.getByText("Inicio de sesión")).toBeInTheDocument();
  });

  it("valida y guarda una contraseña nueva", async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    supabase.auth.updateUser.mockResolvedValue({ error: null });
    renderPage({ user: { id: "owner-id" }, isLoading: false, signOut });
    fireEvent.change(screen.getByLabelText("Nueva contraseña"), { target: { value: "ClaveNueva#2026" } });
    fireEvent.change(screen.getByLabelText("Repetir contraseña"), { target: { value: "ClaveNueva#2026" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar nueva contraseña" }));
    await waitFor(() => expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: "ClaveNueva#2026" }));
    expect(signOut).toHaveBeenCalled();
  });
});
