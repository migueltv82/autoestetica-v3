export const OWNER_ROLES = ["owner"];
export const OWNER_ADMIN_ROLES = ["owner", "admin"];
export const STAFF_ROLES = ["owner", "admin", "employee"];

export function hasRole(profile, roles) {
  return Boolean(profile?.active !== false && roles.includes(profile?.role));
}

export function getDefaultAdminPath(profile) {
  return profile?.role === "employee" ? "/admin/turnos" : "/admin/dashboard";
}

export function safeAdminRedirect(value, fallback = "/admin/login") {
  return typeof value === "string"
    && /^\/admin(?:\/[a-z0-9-]+)*\/?$/i.test(value)
    && !value.includes("\\")
    ? value
    : fallback;
}

export function getPermissions(profile) {
  const isOwner = hasRole(profile, OWNER_ROLES);
  const isOwnerAdmin = hasRole(profile, OWNER_ADMIN_ROLES);
  const canViewStaffSections = hasRole(profile, STAFF_ROLES);

  return {
    canViewDashboard: isOwnerAdmin,
    canViewAgenda: canViewStaffSections,
    canViewClients: canViewStaffSections,
    canOperate: isOwnerAdmin,
    canManageTurns: isOwnerAdmin,
    canManageClients: isOwnerAdmin,
    canManageFinance: isOwnerAdmin,
    canManageCatalog: isOwnerAdmin,
    canManageGallery: isOwnerAdmin,
    canManageSettings: isOwner,
    canManageTeam: isOwner,
    canManageScheduleBlocks: isOwner,
    canDeleteTurns: isOwnerAdmin,
    canViewPlan: isOwner,
  };
}
