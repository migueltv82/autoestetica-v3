import EmptyState from "../ui/EmptyState";
import { 
  Trash2, 
  Calendar, 
  Clock, 
  Phone, 
  Wrench, 
  Car, 
  Bike, 
  Truck, 
  Box, 
  User 
} from "lucide-react";
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

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmado": return "status-confirmed";
      case "Pendiente": return "status-pending";
      case "Finalizado": return "status-finished";
      case "Cancelado": return "status-cancelled";
      default: return "";
    }
  };

  return (
    <div className="simple-table-container">
      <table className="simple-admin-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Horario</th>
            <th>Estado</th>
            <th style={{ textAlign: "right" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {turns.map((turn) => (
            <tr key={turn.id} className={turn.status === "Finalizado" ? "row-muted" : ""}>
              <td>
                <div className="client-info-cell">
                  <div className="client-avatar">
                    <User size={14} />
                  </div>
                  <div>
                    <span className="client-name">{turn.client}</span>
                    <span className="client-sub">{turn.vehicle}</span>
                  </div>
                </div>
              </td>
              <td>
                <div className="service-info-cell">
                  <Wrench size={14} className="icon-sub" />
                  <span>{turn.service}</span>
                </div>
              </td>
              <td>
                <div className="time-info-cell">
                  <Clock size={14} className="icon-sub" />
                  <span>{turn.time}</span>
                  <span className="date-sub">{turn.date}</span>
                </div>
              </td>
              <td>
                <select
                  className={`status-select-simple ${getStatusClass(turn.status)}`}
                  value={turn.status}
                  onChange={(e) => onStatusChange(turn.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </td>
              <td style={{ textAlign: "right" }}>
                <button 
                  className="btn-action-danger" 
                  onClick={() => onDeleteTurn(turn.id)}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TurnsTable;