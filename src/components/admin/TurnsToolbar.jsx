import { Search, Filter, Calendar, X } from "lucide-react";
import "./TurnsToolbar.css";

function TurnsToolbar({ filters, onFilterChange, onClearFilters }) {
  const hasFilters = filters?.search || filters?.date || filters?.status;

  return (
    <div className="dashboard-panel turns-toolbar-v3">
      <div className="toolbar-grid">
        <div className="toolbar-search">
          <label className="toolbar-label"><Search size={14} /> Buscador Proactivo</label>
          <input
            type="text"
            name="search"
            className="admin-input"
            placeholder="Cliente, servicio o patente..."
            value={filters?.search || ""}
            onChange={onFilterChange}
          />
        </div>

        <div className="toolbar-date">
          <label className="toolbar-label"><Calendar size={14} /> Fecha Agenda</label>
          <input
            type="date"
            name="date"
            className="admin-input"
            value={filters?.date || ""}
            onChange={onFilterChange}
          />
        </div>

        <div className="toolbar-status">
          <label className="toolbar-label"><Filter size={14} /> Filtrar por Estado</label>
          <select
            name="status"
            className="admin-input"
            value={filters?.status || ""}
            onChange={onFilterChange}
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Consulta">Consulta</option>
            <option value="Seña pendiente">Seña pendiente</option>
            <option value="Confirmado">Confirmado</option>
            <option value="En proceso">En proceso</option>
            <option value="Listo">Listo</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Cancelado">Cancelado</option>
            <option value="No asistió">No asistió</option>
          </select>
        </div>

        <div className="toolbar-actions">
           {hasFilters && (
            <button className="btn-ghost reset-btn-v3" onClick={onClearFilters}>
              <X size={16} /> Limpiar Filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TurnsToolbar;
