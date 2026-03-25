import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate("/admin/dashboard");
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <span className="admin-login-kicker">Acceso interno</span>

        <h1 className="admin-login-title">Ingresar al panel</h1>

        <p className="admin-login-text">
          Este acceso es solo para administración interna de Autoestética Tucumán.
        </p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-group">
            <label>Usuario</label>
            <input
              className="admin-login-input"
              type="text"
              placeholder="Ingresá tu usuario"
            />
          </div>

          <div className="admin-login-group">
            <label>Contraseña</label>
            <input
              className="admin-login-input"
              type="password"
              placeholder="Ingresá tu contraseña"
            />
          </div>

          <button type="submit" className="admin-login-button">
            Ingresar
          </button>
        </form>

        <div className="admin-login-back">
          <Link to="/">Volver al sitio</Link>
        </div>
      </div>
    </main>
  );
}

export default Login;