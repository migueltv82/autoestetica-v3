import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import businessLogo from "../../assets/logo.webp";
import "./Login.css";
import "./Mfa.css";
import "./ResetPassword.css";

export default function ResetPassword() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isLoading && !user) {
    return <Navigate to="/admin/login" replace state={{ authError: "El enlace de recuperación no es válido o ya venció. Solicitá uno nuevo." }} />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (password.length < 12) { setError("La nueva contraseña debe tener al menos 12 caracteres."); return; }
    if (password !== confirmation) { setError("Las contraseñas no coinciden."); return; }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setBusy(false);
      setError("No pudimos actualizar la contraseña. Pedí un nuevo enlace e intentá otra vez.");
      return;
    }
    await signOut();
    navigate("/admin/login", { replace: true, state: { passwordUpdated: true } });
  }

  return (
    <main className="mfa-page">
      <section className="mfa-card reset-password-card">
        <img src={businessLogo} alt="Autoestética Tucumán" />
        <span><ShieldCheck size={15} /> Recuperación segura</span>
        <h1>Creá una nueva contraseña</h1>
        <p>Usá al menos 12 caracteres y evitá repetir una contraseña anterior.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="new-password"><KeyRound size={14} /> Nueva contraseña</label>
          <input id="new-password" type="password" autoComplete="new-password" value={password}
            onChange={(event) => setPassword(event.target.value)} minLength="12" required />
          <label htmlFor="confirm-password">Repetir contraseña</label>
          <input id="confirm-password" type="password" autoComplete="new-password" value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)} minLength="12" required />
          {error ? <p className="login-feedback error" role="alert">{error}</p> : null}
          <button type="submit" className="login-submit-premium" disabled={busy || isLoading}>
            {busy ? "Guardando…" : "Guardar nueva contraseña"}
          </button>
        </form>
        <Link className="login-forgot" to="/admin/login">Volver al inicio de sesión</Link>
      </section>
    </main>
  );
}
