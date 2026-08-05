import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import "./AdminLayout.css";
import "./AdminButtons.css";

function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const isSettingsFocus = pathname === "/admin/configuracion";

  return (
    <div className={`admin-shell${isSettingsFocus ? " admin-shell-settings-focus" : ""}`}>
      <a className="skip-link" href="#admin-content">Saltar al contenido</a>
      <AdminNavbar />
      <main className="admin-main" id="admin-content" tabIndex="-1">
        {isSettingsFocus ? (
          <nav className="admin-focus-bar" aria-label="Navegación de ajustes">
            <Link to="/admin"><ArrowLeft size={18} /> Volver al panel</Link>
            <span><SlidersHorizontal size={17} /> Modo de ajustes</span>
          </nav>
        ) : null}
        <div className="admin-container">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
