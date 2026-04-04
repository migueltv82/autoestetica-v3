import EmptyState from "../ui/EmptyState";
import { Edit2, Trash2, Calendar, Clock, User, Phone, Wrench, Car, Bike, Truck, Box } from "lucide-react";
import "./TurnsTable.css";

const STATUS_OPTIONS = ["Pendiente", "Confirmado", "Finalizado", "Cancelado"];

function TurnsTable({ turns, onStatusChange, onDeleteTurn }) {
  if (!turns.length) {
    return (
      <EmptyState
        title="No hay turnos registrados"
        text="Ajustá los filtros o cargá un turno nuevo."
      />
    );
  }

  const getVehicleIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "moto": return <Bike size={14} />;
      case "camioneta": return <Truck size={14} />;
      case "suv": return <Box size={14} />;
      default: return <Car size={14} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmado": return "var(--color-primary)";
      case "Pendiente": return "#facc15";
      case "Finalizado": return "#38bdf8";
      case "Cancelado": return "#f87171";
      default: return "#94a3b8"; 
    }
  };

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: "120px" }}>Agenda</th>
            <th>Cliente y Contacto</th>
            <th>Servicio</th>
            <th>Vehículo</th>
            <th style={{ textAlign: "center" }}>Estado Operativo</th>
            <th style={{ textAlign: "right" }}>Gestión</th>
          </tr>
        </thead>
        <tbody>
          {turns.map((turn) => (
            <tr key={turn.id} className={turn.status === "Finalizado" ? "row-finished" : ""}>
              <td>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 800, color: "var(--color-white)", fontSize: "1rem" }}>
                     <Clock size={14} className="text-primary" /> {turn.time}
                   </div>
                   <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--color-text-soft)" }}>
                     <Calendar size={12} /> {turn.date}
                   </div>
                </div>
              </td>
              <td>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.05rem", color: "var(--color-white)" }}>
                    {turn.client}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-soft)" }}>
                    <Phone size={12} /> {turn.phone || "N/A"}
                  </div>
                </div>
              </td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--color-text)", fontWeight: 500 }}>
                  <Wrench size={16} className="text-secondary" style={{ opacity: 0.8 }} />
                  {turn.service}
                </div>
              </td>
              <td>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.03)", padding: "0.4rem 0.75rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.05)" }}>
                  {getVehicleIcon(turn.vehicle)}
                  {turn.vehicle}
                </div>
              </td>
              <td style={{ textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                  <div 
                    style={{ 
                      width: "8px", 
                      height: "8px", 
                      borderRadius: "50%", 
                      background: getStatusColor(turn.status),
                      boxShadow: `0 0 10px ${getStatusColor(turn.status)}`
                    }} 
                  />
                  <select
                    className="admin-input-minimal"
                    style={{ color: getStatusColor(turn.status), fontWeight: 700 }}
                    value={turn.status}
                    onChange={(event) => onStatusChange(turn.id, event.target.value)}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
              <td>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                  <button className="btn-ghost btn-mini-action" title="Editar"><Edit2 size={14} /></button>
                  <button className="btn-danger btn-mini-action" onClick={() => onDeleteTurn(turn.id)} title="Borrar"><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TurnsTable;