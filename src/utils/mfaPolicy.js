const MFA_ROLES = new Set(["owner", "admin"]);

export function requiresAdminMfa(profile, environment = import.meta.env) {
  const mfaEnabled = environment.PROD || environment.VITE_REQUIRE_MFA === "true";
  return Boolean(mfaEnabled && MFA_ROLES.has(profile?.role));
}
