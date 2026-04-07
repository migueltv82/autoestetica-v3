import EmptyState from "../ui/EmptyState";
import { Edit2, Trash2, Calendar, Clock, User, Phone, Wrench, Car, Bike, Truck, Box, ChevronRight } from "lucide-react";
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
      case "moto": return <Bike size={16} />;
      case "camioneta": return <Truck size={16} />;
      case "suv": return <Box size={16} />;
      default: return <Car size={16} />;
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
      {/* Desktop Table View */}
      <table className="admin-table desktop-only-table">
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
                <div className="turn-agenda-cell">
                   <div className="turn-time-val">
                     <Clock size={14} className="text-primary" /> {turn.time}
                   </div>
                   <div className="turn-date-val">
                     <Calendar size={12} /> {turn.date}
                   </div>
                </div>
              </td>
              <td>
                <div className="turn-client-cell">
                  <div className="turn-client-name">{turn.client}</div>
                  <div className="turn-client-phone">
                    <Phone size={12} /> {turn.phone || "N/A"}
                  </div>
                </div>
              </td>
              <td>
                <div className="turn-service-cell">
                  <Wrench size={16} className="text-secondary" />
                  {turn.service}
                </div>
              </td>
              <td>
                <div className="vehicle-badge">
                  {getVehicleIcon(turn.vehicle)}
                  {turn.vehicle}
                </div>
              </td>
              <td style={{ textAlign: "center" }}>
                <div className="status-selector-wrap">
                  <div 
                    className="status-dot"
                    style={{ 
                      background: getStatusColor(turn.status),
                      boxShadow: `0 0 10px ${getStatusColor(turn.status)}`
                    }} 
                  />
                  <select
                    className="admin-input-minimal"
                    style={{ color: getStatusColor(turn.status) }}
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
                <div className="turn-actions-cell">
                  <button className="btn-ghost btn-mini-action" title="Editar"><Edit2 size={14} /></button>
                  <button className="btn-danger btn-mini-action" onClick={() => onDeleteTurn(turn.id)} title="Borrar"><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="mobile-only-card">
        {turns.map((turn) => (
          <div key={turn.id} className={`turn-mobile-card ${turn.status === "Finalizado" ? "row-finished" : ""}`}>
            <div className="card-header-mobile">
              <div className="card-agenda-mobile">
                <span className="time-val-mobile">{turn.time}</span>
                <span className="date-val-mobile">{turn.date}</span>
              </div>
              <div 
                className="status-badge-mobile"
                style={{ background: `${getStatusColor(turn.status)}20`, color: getStatusColor(turn.status), border: `1px solid ${getStatusColor(turn.status)}40` }}
              >
                {turn.status}
              </div>
            </div>

            <div className="card-body-mobile">
              <div className="card-client-row">
                <div className="client-avatar-mini">{turn.client.charAt(0)}</div>
                <div className="client-info-mini">
                  <strong>{turn.client}</strong>
                  <span>{turn.phone || "Sin teléfono"}</span>
                </div>
              </div>
              
              <div className="card-details-grid-mobile">
                <div className="detail-item-mobile">
                  <span className="detail-label">Servicio</span>
                  <div className="detail-val"><Wrench size={14} /> {turn.service}</div>
                </div>
                <div className="detail-item-mobile">
                  <span className="detail-label">Vehículo</span>
                  <div className="detail-val">{getVehicleIcon(turn.vehicle)} {turn.vehicle}</div>
                </div>
              </div>
            </div>

            <div className="card-footer-mobile">
              <div className="status-quick-change">
                <select
                  className="admin-input-minimal full-width"
                  value={turn.status}
                  onChange={(event) => onStatusChange(turn.id, event.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      Marcar como {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="card-actions-mobile">
                <button className="btn-ghost-mini"><Edit2 size={16} /></button>
                <button className="btn-danger-mini" onClick={() => onDeleteTurn(turn.id)}><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TurnsTable;