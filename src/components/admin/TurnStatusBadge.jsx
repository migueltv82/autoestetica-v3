import "./TurnStatusBadge.css";

function TurnStatusBadge({ status }) {
  const normalizedStatus = (status || "").toLowerCase();

  return (
    <span className={`turn-status-badge ${normalizedStatus}`}>
      {status || "Pendiente"}
    </span>
  );
}

export default TurnStatusBadge;