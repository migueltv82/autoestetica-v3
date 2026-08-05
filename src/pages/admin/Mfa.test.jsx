import { describe, expect, it } from "vitest";
import { mfaErrorMessage } from "../../utils/mfaErrors";

describe("mfaErrorMessage", () => {
  it("explica cuando TOTP está deshabilitado en Supabase", () => {
    expect(mfaErrorMessage({ code: "mfa_totp_enroll_not_enabled" })).toContain("Authenticator App");
  });

  it("explica los factores incompletos y cambios de red", () => {
    expect(mfaErrorMessage({ code: "mfa_factor_name_conflict" })).toContain("configuración anterior incompleta");
    expect(mfaErrorMessage({ code: "mfa_ip_address_mismatch" })).toContain("misma conexión");
  });

  it("mantiene un mensaje específico para códigos incorrectos", () => {
    expect(mfaErrorMessage({ code: "mfa_verification_failed" }, "verify")).toContain("no es válido");
  });
});
