import { describe, expect, it } from "vitest";
import { requiresAdminMfa } from "./mfaPolicy";

describe("requiresAdminMfa", () => {
  it("exige MFA a owner y admin en produccion", () => {
    expect(requiresAdminMfa({ role: "owner" }, { PROD: true })).toBe(true);
    expect(requiresAdminMfa({ role: "admin" }, { PROD: true })).toBe(true);
  });

  it("no exige MFA durante el desarrollo local", () => {
    expect(requiresAdminMfa({ role: "owner" }, { PROD: false })).toBe(false);
  });

  it("no exige MFA a empleados", () => {
    expect(requiresAdminMfa({ role: "employee" }, { PROD: true })).toBe(false);
  });
});
