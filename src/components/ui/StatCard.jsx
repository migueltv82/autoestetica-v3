import "./StatCard.css";

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <span className="stat-card-label">{label}</span>
      <strong className="stat-card-value">{value}</strong>
    </article>
  );
}

export default StatCard;