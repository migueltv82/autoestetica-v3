import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { getDefaultAdminPath, safeAdminRedirect } from "../../utils/permissions";
import { requiresAdminMfa } from "../../utils/mfaPolicy";
import businessLogo from "../../assets/logo.webp";
import { mfaErrorMessage } from "../../utils/mfaErrors";
import "./Login.css";
import "./Mfa.css";

export default function Mfa() {
  const { profile, assuranceLevel, mfaFactors, refreshMfa, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [enrollment, setEnrollment] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const verifiedFactor = useMemo(() => mfaFactors.find((factor) => factor.status === "verified"), [mfaFactors]);

  useEffect(() => {
    if (assuranceLevel === "aal2") navigate(safeAdminRedirect(location.state?.from, getDefaultAdminPath(profile)), { replace: true });
  }, [assuranceLevel, location.state, navigate, profile]);

  if (!profile) return <Navigate to="/admin/login" replace />;
  if (!requiresAdminMfa(profile)) {
    return <Navigate to={safeAdminRedirect(location.state?.from, getDefaultAdminPath(profile))} replace />;
  }

  async function beginEnrollment() {
    setBusy(true); setError("");
    const incompleteFactors = mfaFactors.filter((factor) => factor.status === "unverified");
    for (const factor of incompleteFactors) {
      const { error: cleanupError } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
      if (cleanupError && cleanupError.code !== "mfa_factor_not_found") {
        setBusy(false);
        setError(mfaErrorMessage(cleanupError));
        return;
      }
    }
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp", issuer: "Autoestética Tucumán",
    });
    setBusy(false);
    if (enrollError) { setError(mfaErrorMessage(enrollError)); return; }
    setEnrollment(data);
  }

  async function verify(event) {
    event.preventDefault();
    const factorId = verifiedFactor?.id || enrollment?.id;
    if (!factorId || !/^\d{6}$/.test(code)) { setError("Ingresá el código de 6 dígitos de tu aplicación."); return; }
    setBusy(true); setError("");
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (verifyError) { setBusy(false); setError(mfaErrorMessage(verifyError, "verify")); return; }
    await refreshMfa();
    setBusy(false);
  }

  return (
    <main className="mfa-page">
      <section className="mfa-card">
        <img src={businessLogo} alt="Autoestética Tucumán" />
        <span><ShieldCheck size={15} /> Verificación administrativa</span>
        <h1>Protegé tu cuenta</h1>
        {verifiedFactor ? <p>Ingresá el código actual de tu aplicación autenticadora para continuar.</p> : <p>Activá el segundo factor con Google Authenticator, Microsoft Authenticator o Authy.</p>}

        {!verifiedFactor && !enrollment ? <button type="button" className="login-submit-premium" onClick={beginEnrollment} disabled={busy}>
          <KeyRound size={18} /> {busy ? "Preparando…" : "Activar segundo factor"}
        </button> : null}

        {enrollment?.totp ? <div className="mfa-enrollment">
          <img src={enrollment.totp.qr_code} alt="Código QR para configurar el autenticador" />
          <small>Si no podés escanearlo, ingresá esta clave manualmente:</small>
          <code>{enrollment.totp.secret}</code>
        </div> : null}

        {(verifiedFactor || enrollment) ? <form onSubmit={verify}>
          <label htmlFor="mfa-code">Código de 6 dígitos</label>
          <input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" autoFocus required />
          {error ? <p className="login-feedback error" role="alert">{error}</p> : null}
          <button type="submit" className="login-submit-premium" disabled={busy || code.length !== 6}>{busy ? "Verificando…" : "Verificar e ingresar"}</button>
        </form> : error ? <p className="login-feedback error" role="alert">{error}</p> : null}
        <button type="button" className="login-forgot" onClick={signOut}>Cerrar sesión</button>
      </section>
    </main>
  );
}
