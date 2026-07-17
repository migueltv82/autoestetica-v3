import AdminNavbar from "./AdminNavbar";
import "./AdminLayout.css";
import "./AdminButtons.css";

function AdminLayout({ children }) {
  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-content">Saltar al contenido</a>
      <AdminNavbar />
      <main className="admin-main" id="admin-content" tabIndex="-1">
        <div className="admin-container">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
