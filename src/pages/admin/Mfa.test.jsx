import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import { mfaErrorMessage } from "../../utils/mfaErrors";
import Mfa from "./Mfa";

vi.mock("../../hooks/useAuth", () => ({ useAuth: vi.fn() }));

describe("mfaErrorMessage", () => {
  it("explica cuando TOTP esta deshabilitado en Supabase", () => {
    expect(mfaErrorMessage({ code: "mfa_totp_enroll_not_enabled" })).toContain("Authenticator App");
  });

  it("explica los factores incompletos y cambios de red", () => {
    expect(mfaErrorMessage({ code: "mfa_factor_name_conflict" })).toContain("anterior incompleta");
    expect(mfaErrorMessage({ code: "mfa_ip_address_mismatch" })).toContain("misma conex");
  });

  it("mantiene un mensaje especifico para codigos incorrectos", () => {
    expect(mfaErrorMessage({ code: "mfa_verification_failed" }, "verify")).toContain("no es v");
  });
});

describe("Mfa", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("sale del configurador incompleto cuando MFA no se exige localmente", () => {
    vi.stubEnv("VITE_REQUIRE_MFA", "false");
    useAuth.mockReturnValue({
      profile: { role: "owner", active: true },
      assuranceLevel: "aal1",
      mfaFactors: [],
      refreshMfa: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/admin/mfa"]}>
        <Routes>
          <Route path="/admin/mfa" element={<Mfa />} />
          <Route path="/admin/dashboard" element={<div>Panel principal</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Panel principal")).toBeInTheDocument();
  });
});
