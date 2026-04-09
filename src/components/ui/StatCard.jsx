import "./StatCard.css";

function StatCard({ label, value, icon, color = "var(--color-primary)" }) {
  return (
    <article className="stat-card" style={{ "--card-color": color }}>
      <div className="stat-card-content">
        <span className="stat-card-label">{label}</span>
        <strong className="stat-card-value">{value}</strong>
      </div>
      {icon && <div className="stat-card-icon">{icon}</div>}
    </article>
  );
}

export default StatCard;