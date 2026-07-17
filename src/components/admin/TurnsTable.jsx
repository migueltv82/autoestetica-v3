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
  User,
  ReceiptText,
  Pencil,
  MessageCircle
} from "lucide-react";
import { appointmentWhatsAppLink } from "../../utils/whatsapp";
import "./TurnsTable.css";

const STATUS_OPTIONS = ["Consulta", "Pendiente", "Seña pendiente", "Confirmado", "En proceso", "Listo", "Finalizado", "Cancelado", "No asistió"];

function TurnsTable({ turns, onStatusChange, onDeleteTurn, onGenerateReceipt, onEditTurn }) {
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
      case "En proceso": return "status-progress";
      case "Listo": return "status-ready";
      case "Pendiente": return "status-pending";
      case "Consulta": return "status-pending";
      case "Seña pendiente": return "status-pending";
      case "Finalizado": return "status-finished";
      case "Cancelado": return "status-cancelled";
      case "No asistió": return "status-cancelled";
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
                {turn.phone && !["Cancelado", "Finalizado"].includes(turn.status) ? <a className="btn-action-confirm" href={appointmentWhatsAppLink(turn)} target="_blank" rel="noreferrer" title={turn.status === "Listo" ? "Avisar por WhatsApp" : "Enviar confirmación por WhatsApp"}><MessageCircle size={16} /><span>{turn.status === "Listo" ? "Avisar listo" : "Confirmar turno"}</span></a> : null}
                {onEditTurn ? <button className="btn-ghost btn-mini-action" onClick={() => onEditTurn(turn)} title="Editar turno"><Pencil size={16} /></button> : null}
                {onGenerateReceipt ? (
                  <button
                    className="btn-action-receipt"
                    onClick={() => onGenerateReceipt(turn)}
                    title="Generar recibo"
                  >
                    <ReceiptText size={16} />
                  </button>
                ) : null}
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
