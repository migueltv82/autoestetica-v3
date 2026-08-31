import "./AdminPageHeader.css";

function AdminPageHeader({ title, subtitle, actions, icon, eyebrow }) {
  return (
    <div className="admin-page-header">
      <div className="admin-page-header-copy">
        {(icon || eyebrow) && (
          <div className="admin-page-header-meta">
            {icon ? <span className="admin-page-header-icon">{icon}</span> : null}
            {eyebrow ? <span className="admin-page-header-kicker">{eyebrow}</span> : null}
          </div>
        )}
        <h2 className="admin-page-header-title">{title}</h2>
        {subtitle ? <p className="admin-page-header-text">{subtitle}</p> : null}
      </div>

      {actions ? <div className="admin-page-header-actions">{actions}</div> : null}
    </div>
  );
}

export default AdminPageHeader;
