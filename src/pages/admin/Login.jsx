import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Lock, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import PageTransition from "../../components/ui/PageTransition";
import { useAuth } from "../../hooks/useAuth";
import { getDefaultAdminPath, safeAdminRedirect } from "../../utils/permissions";
import loginBg from "../../assets/login-bg.webp";
import businessLogo from "../../assets/logo.webp";
import "./Login.css";

function Login() {
  const location = useLocation();
  const { user, profile, assuranceLevel, isLoading, signIn, signOut, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => location.state?.authError || "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    const { error: authError } = await signIn(email.trim(), password);
    setIsSubmitting(false);
    if (authError) {
      setError(authError.message === "Invalid login credentials" ? "Email o contraseña incorrectos." : "No pudimos iniciar sesión. Intentá nuevamente.");
      return;
    }
    // AuthContext espera a cargar perfil y MFA; la redirección se resuelve abajo
    // con el estado completo para evitar ciclos login → panel → login.
  }

  async function handleResetPassword() {
    if (!email.trim()) {
      setError("Ingresá tu email para recuperar la contraseña.");
      return;
    }
    setError("");
    const { error: resetError } = await resetPassword(email.trim());
    if (resetError) setError("No pudimos enviar el correo de recuperación.");
    else setMessage("Te enviamos un enlace de recuperación a tu email.");
  }

  if (!isLoading && user && profile && profile.active !== false) {
    const needsMfa = ["owner", "admin"].includes(profile?.role) && assuranceLevel !== "aal2";
    const destination = safeAdminRedirect(location.state?.from, getDefaultAdminPath(profile));
    return <Navigate to={needsMfa ? "/admin/mfa" : destination} replace state={needsMfa ? { from: destination } : undefined} />;
  }

  return (
    <PageTransition>
      <main className="super-premium-login">
        <div className="login-background-overlay">
          <img src={loginBg} alt="Auto en proceso de detailing" className="login-bg-img" />
          <div className="login-glass-blur" />
        </div>
        <div className="login-content-wrapper">
          <div className="admin-login-card-v3 glass-panel-premium">
            <div className="login-brand-header">
              <div className="brand-logo-container"><img src={businessLogo} alt="Autoestética Tucumán" className="login-brand-logo" /></div>
              <div className="login-title-group">
                <span className="premium-badge">Acceso seguro</span>
                <h1 className="login-main-title">Sistema de gestión</h1>
                <p className="login-sub-text">Iniciá sesión con tu cuenta autorizada para administrar Autoestética Tucumán.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="premium-login-form">
              <div className="premium-input-group">
                <label className="premium-input-label"><Mail size={14} /> Email</label>
                <div className="premium-input-wrapper">
                  <input className="admin-input-premium-v2" type="email" placeholder="tu@email.com" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
                </div>
              </div>
              <div className="premium-input-group">
                <label className="premium-input-label"><Lock size={14} /> Contraseña</label>
                <div className="premium-input-wrapper">
                  <input className="admin-input-premium-v2" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
                </div>
              </div>
              {error ? <div className="login-feedback error" role="alert">{error}</div> : null}
              {message ? <div className="login-feedback success" role="status">{message}</div> : null}
              {!isLoading && user && !profile ? (
                <div className="login-feedback error" role="alert">
                  La cuenta existe pero no está vinculada al negocio.
                  <button type="button" className="login-inline-action" onClick={signOut}>Cerrar esta sesión</button>
                </div>
              ) : null}
              {!isLoading && user && profile?.active === false ? (
                <div className="login-feedback error" role="alert">
                  Tu usuario está bloqueado y no puede acceder al panel.
                  <button type="button" className="login-inline-action" onClick={signOut}>Cerrar esta sesión</button>
                </div>
              ) : null}
              <button type="button" className="login-forgot" onClick={handleResetPassword}>Olvidé mi contraseña</button>
              <button type="submit" className="login-submit-premium" disabled={isSubmitting}>
                <span>{isSubmitting ? "Verificando…" : "Ingresar al panel"}</span><ArrowRight size={20} className="btn-icon-move" />
              </button>
            </form>
            <footer className="login-footer-minimal"><Link to="/" className="back-link-v3"><ArrowLeft size={16} /><span>Volver al sitio</span></Link></footer>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}

export default Login;
