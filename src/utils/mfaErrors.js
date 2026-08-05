export function mfaErrorMessage(error, action = "enroll") {
  const code = error?.code || error?.name || "";
  if (["mfa_totp_enroll_not_enabled", "mfa_totp_verify_not_enabled"].includes(code)) {
    return "El segundo factor TOTP está deshabilitado en Supabase. Activá Authenticator App en Authentication → Multi-Factor Authentication.";
  }
  if (code === "mfa_factor_name_conflict") return "Quedó una configuración anterior incompleta. Volvé a intentarlo para generar un código nuevo.";
  if (code === "mfa_ip_address_mismatch") return "La configuración debe comenzar y terminar en la misma conexión. Desactivá VPN o cambio de red y reintentá.";
  if (["no_authorization", "session_not_found", "refresh_token_not_found"].includes(code)) return "La sesión venció. Cerrá sesión e ingresá nuevamente.";
  if (["over_request_rate_limit", "mfa_challenge_expired"].includes(code)) return "Esperá unos minutos y volvé a intentarlo.";
  if (action === "verify" && code === "mfa_verification_failed") return "El código no es válido. Esperá el próximo código de tu aplicación e intentá otra vez.";
  return action === "verify"
    ? "No pudimos verificar el código. Revisalo e intentá nuevamente."
    : `No pudimos preparar el segundo factor${error?.message ? `: ${error.message}` : "."}`;
}
