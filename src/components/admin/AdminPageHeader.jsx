import "./AdminPageHeader.css";

function AdminPageHeader({ title, subtitle, actions }) {
  return (
    <div className="admin-page-header">
      <div>
        <h2 className="admin-page-header-title">{title}</h2>
        {subtitle ? <p className="admin-page-header-text">{subtitle}</p> : null}
      </div>

      {actions ? <div className="admin-page-header-actions">{actions}</div> : null}
    </div>
  );
}

export default AdminPageHeader;