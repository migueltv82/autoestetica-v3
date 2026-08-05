import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import Login from "./Login";

vi.mock("../../hooks/useAuth", () => ({ useAuth: vi.fn() }));

function renderLogin(authState, entry = "/admin/login") {
  useAuth.mockReturnValue({ signIn: vi.fn(), signOut: vi.fn(), resetPassword: vi.fn(), ...authState });
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/mfa" element={<div>Verificación MFA</div>} />
        <Route path="/admin/turnos" element={<div>Agenda privada</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("no redirige mientras existe sesión pero el perfil todavía no cargó", () => {
    renderLogin({ user: { id: "owner-id" }, profile: null, assuranceLevel: "aal1", isLoading: false });
    expect(screen.getByRole("heading", { name: "Sistema de gestión" })).toBeInTheDocument();
    expect(screen.queryByText("Agenda privada")).not.toBeInTheDocument();
  });

  it("envía owner y admin sin AAL2 a la verificación MFA", () => {
    renderLogin({ user: { id: "owner-id" }, profile: { role: "owner", active: true }, assuranceLevel: "aal1", isLoading: false });
    expect(screen.getByText("Verificación MFA")).toBeInTheDocument();
  });

  it("permite entrar al empleado con su perfil completo", () => {
    renderLogin({ user: { id: "employee-id" }, profile: { role: "employee", active: true }, assuranceLevel: "aal1", isLoading: false });
    expect(screen.getByText("Agenda privada")).toBeInTheDocument();
  });
});
