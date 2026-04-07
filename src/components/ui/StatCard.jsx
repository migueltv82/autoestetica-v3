import "./StatCard.css";

function StatCard({ label, value, icon }) {
  return (
    <article className="stat-card">
      <div className="stat-card-content">
        <span className="stat-card-label">{label}</span>
        <strong className="stat-card-value">{value}</strong>
      </div>
      {icon && <div className="stat-card-icon">{icon}</div>}
    </article>
  );
}

export default StatCard;