import EmptyState from "../ui/EmptyState";
import TurnStatusBadge from "./TurnStatusBadge";
import "./TurnsTable.css";

const STATUS_OPTIONS = ["Pendiente", "Confirmado", "Finalizado", "Cancelado"];

function TurnsTable({ turns, onStatusChange, onDeleteTurn }) {
  if (!turns.length) {
    return (
      <EmptyState
        title="No hay turnos para mostrar"
        text="Probá cargando un turno nuevo o ajustando los filtros."
      />
    );
  }

  return (
    <div className="turns-table-wrap">
      <table className="turns-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Vehículo</th>
            <th>Servicio</th>
            <th>Estado actual</th>
            <th>Cambiar estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {turns.map((turn) => (
            <tr key={turn.id}>
              <td>{turn.date}</td>
              <td>{turn.time}</td>
              <td>{turn.client}</td>
              <td>{turn.phone}</td>
              <td>{turn.vehicle}</td>
              <td>{turn.service}</td>
              <td>
                <TurnStatusBadge status={turn.status} />
              </td>
              <td>
                <select
                  className="turns-table-select"
                  value={turn.status}
                  onChange={(event) => onStatusChange(turn.id, event.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button
                  type="button"
                  className="turns-table-delete"
                  onClick={() => onDeleteTurn(turn.id)}
                >
                  Eliminar
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