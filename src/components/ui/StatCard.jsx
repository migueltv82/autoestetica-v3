import "./StatCard.css";

function StatCard({ label, value, icon, color = "var(--color-primary)", trend }) {
  return (
    <article className="stat-card" style={{ "--card-color": color }}>
      <div className="stat-card-content">
        <span className="stat-card-label">{label}</span>
        <strong className="stat-card-value">{value}</strong>
        {trend ? <span className="stat-card-trend">{trend}</span> : null}
      </div>
      {icon ? <div className="stat-card-icon">{icon}</div> : null}
    </article>
  );
}

export default StatCard;
