import "./StatCard.css";

const COLOR_CLASS_BY_VALUE = {
  "var(--color-primary)": "stat-card-primary",
  "#4ade80": "stat-card-green",
  "#f87171": "stat-card-red",
  "#38bdf8": "stat-card-blue",
  "#fbbf24": "stat-card-amber",
  "#facc15": "stat-card-yellow",
};

function StatCard({ label, value, icon, color = "var(--color-primary)", trend }) {
  const colorClass = COLOR_CLASS_BY_VALUE[color] || "stat-card-primary";

  return (
    <article className={`stat-card ${colorClass}`}>
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
