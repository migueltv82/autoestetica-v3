import "./AdminTopbar.css";

function AdminTopbar({ title, subtitle }) {
  return (
    <header className="admin-topbar">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </header>
  );
}

export default AdminTopbar;