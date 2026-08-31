import { describe, expect, it } from "vitest";
import {
  getDefaultAdminPath,
  getPermissions,
  hasRole,
  OWNER_ADMIN_ROLES,
  OWNER_ROLES,
  STAFF_ROLES,
  safeAdminRedirect,
} from "./permissions";

const activeProfile = (role) => ({ id: `${role}-id`, role, active: true });

describe("permissions", () => {
  it("gives owner full access including settings and team management", () => {
    const profile = activeProfile("owner");

    expect(hasRole(profile, OWNER_ROLES)).toBe(true);
    expect(hasRole(profile, OWNER_ADMIN_ROLES)).toBe(true);
    expect(hasRole(profile, STAFF_ROLES)).toBe(true);
    expect(getDefaultAdminPath(profile)).toBe("/admin/dashboard");
    expect(getPermissions(profile)).toEqual({
      canViewDashboard: true,
      canViewAgenda: true,
      canViewClients: true,
      canOperate: true,
      canManageTurns: true,
      canManageClients: true,
      canManageFinance: true,
      canManageCatalog: true,
      canManageGallery: true,
      canManageSettings: true,
      canManageTeam: true,
      canManageScheduleBlocks: true,
      canDeleteTurns: true,
      canViewPlan: true,
    });
  });

  it("gives admin operational access but keeps owner-only settings blocked", () => {
    const profile = activeProfile("admin");

    expect(getDefaultAdminPath(profile)).toBe("/admin/dashboard");
    expect(getPermissions(profile)).toMatchObject({
      canViewDashboard: true,
      canViewAgenda: true,
      canViewClients: true,
      canOperate: true,
      canManageTurns: true,
      canManageClients: true,
      canManageFinance: true,
      canManageCatalog: true,
      canManageGallery: true,
      canManageSettings: false,
      canManageTeam: false,
      canManageScheduleBlocks: false,
      canDeleteTurns: true,
      canViewPlan: false,
    });
  });

  it("keeps employee in read-only agenda and clients access", () => {
    const profile = activeProfile("employee");

    expect(getDefaultAdminPath(profile)).toBe("/admin/turnos");
    expect(getPermissions(profile)).toMatchObject({
      canViewDashboard: false,
      canViewAgenda: true,
      canViewClients: true,
      canOperate: false,
      canManageTurns: false,
      canManageClients: false,
      canManageFinance: false,
      canManageCatalog: false,
      canManageGallery: false,
      canManageSettings: false,
      canManageTeam: false,
      canManageScheduleBlocks: false,
      canDeleteTurns: false,
      canViewPlan: false,
    });
  });

  it("blocks inactive or missing profiles", () => {
    expect(hasRole({ role: "owner", active: false }, OWNER_ROLES)).toBe(false);
    expect(hasRole(null, STAFF_ROLES)).toBe(false);
    expect(Object.values(getPermissions({ role: "owner", active: false })).every((value) => value === false)).toBe(true);
    expect(Object.values(getPermissions(null)).every((value) => value === false)).toBe(true);
  });

  it("only accepts internal admin redirects", () => {
    expect(safeAdminRedirect("/admin/turnos", "/admin/dashboard")).toBe("/admin/turnos");
    expect(safeAdminRedirect("//evil.example", "/admin/dashboard")).toBe("/admin/dashboard");
    expect(safeAdminRedirect("/admin\\evil.example", "/admin/dashboard")).toBe("/admin/dashboard");
    expect(safeAdminRedirect("https://evil.example", "/admin/dashboard")).toBe("/admin/dashboard");
  });
});
