import AdminNavbar from "./AdminNavbar";
import "./AdminLayout.css";
import "./AdminButtons.css";

function AdminLayout({ children }) {
  return (
    <div className="admin-shell">
      <AdminNavbar />
      <main className="admin-main">
        <div className="admin-container">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
