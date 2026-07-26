import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import { OWNER_ROLES } from "../../utils/permissions";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

function renderProtectedRoute(authState, roles = OWNER_ROLES) {
  useAuth.mockReturnValue(authState);

  return render(
    <MemoryRouter initialEntries={["/admin/configuracion"]}>
      <Routes>
        <Route
          path="/admin/configuracion"
          element={(
            <ProtectedRoute roles={roles}>
              <div>Contenido protegido</div>
            </ProtectedRoute>
          )}
        />
        <Route path="/admin/login" element={<div>Login admin</div>} />
        <Route path="/admin/dashboard" element={<div>Panel principal</div>} />
        <Route path="/admin/turnos" element={<div>Agenda</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders protected content for an active allowed user", () => {
    renderProtectedRoute({
      user: { id: "owner-id" },
      profile: { role: "owner", active: true },
      isLoading: false,
    });

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    renderProtectedRoute({
      user: null,
      profile: null,
      isLoading: false,
    });

    expect(screen.getByText("Login admin")).toBeInTheDocument();
  });

  it("redirects inactive users to login", () => {
    renderProtectedRoute({
      user: { id: "blocked-id" },
      profile: { role: "owner", active: false },
      isLoading: false,
    });

    expect(screen.getByText("Login admin")).toBeInTheDocument();
  });

  it("redirects employees away from owner-only pages to agenda", () => {
    renderProtectedRoute({
      user: { id: "employee-id" },
      profile: { role: "employee", active: true },
      isLoading: false,
    });

    expect(screen.getByText("Agenda")).toBeInTheDocument();
  });
});
