import AdminNavbar from "./AdminNavbar";
import AdminTopbar from "./AdminTopbar";
import "./AdminLayout.css";

function AdminLayout({ title, subtitle, children }) {
  return (
    <div className="admin-shell">
      <AdminNavbar />
      <div className="admin-content-area">
        <AdminTopbar title={title} subtitle={subtitle} />
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;