import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import PageTransition from "../../components/ui/PageTransition";
import loginBg from "../../assets/login_bg.png";
import businessLogo from "../../assets/logo.jpg";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate("/admin/dashboard");
  }

  return (
    <PageTransition>
      <main className="super-premium-login">
        <div className="login-background-overlay">
          <img src={loginBg} alt="Cinematic Detailing Background" className="login-bg-img" />
          <div className="login-glass-blur" />
        </div>

        <div className="login-content-wrapper">
          <div className="admin-login-card-v3 glass-panel-premium">
            <div className="login-brand-header">
               <div className="brand-logo-container">
                 <img src={businessLogo} alt="Autoestética Logo" className="login-brand-logo" />
               </div>
               <div className="login-title-group">
                 <span className="premium-badge">Acceso Reservado</span>
                 <h1 className="login-main-title">Sistema de Gestión</h1>
                 <p className="login-sub-text">Iniciá sesión para administrar la estética de vanguardia.</p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="premium-login-form">
              <div className="premium-input-group">
                <label className="premium-input-label"><User size={14} /> Identificador de Usuario</label>
                <div className="premium-input-wrapper">
                  <input
                    className="admin-input-premium-v2"
                    type="text"
                    placeholder="Tu usuario"
                    required
                  />
                  <div className="input-focus-glow" />
                </div>
              </div>

              <div className="premium-input-group">
                <label className="premium-input-label"><Lock size={14} /> Código de Seguridad</label>
                <div className="premium-input-wrapper">
                  <input
                    className="admin-input-premium-v2"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                  <div className="input-focus-glow" />
                </div>
              </div>

              <button type="submit" className="login-submit-premium">
                <span>Ingresar al Panel</span>
                <ArrowRight size={20} className="btn-icon-move" />
              </button>
            </form>

            <footer className="login-footer-minimal">
              <Link to="/" className="back-link-v3">
                <ArrowLeft size={16} /> <span>Volver al centro de servicios</span>
              </Link>
            </footer>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}

export default Login;