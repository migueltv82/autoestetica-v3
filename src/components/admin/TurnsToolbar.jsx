import "./TurnsToolbar.css";

function TurnsToolbar({ filters, onFilterChange, onClearFilters }) {
  return (
    <div className="turns-toolbar">
      <div className="turns-toolbar-group">
        <label htmlFor="search">Buscar</label>
        <input
          id="search"
          type="text"
          name="search"
          placeholder="Cliente, servicio o vehículo"
          value={filters.search}
          onChange={onFilterChange}
        />
      </div>

      <div className="turns-toolbar-group">
        <label htmlFor="date">Fecha</label>
        <input
          id="date"
          type="date"
          name="date"
          value={filters.date}
          onChange={onFilterChange}
        />
      </div>

      <div className="turns-toolbar-group">
        <label htmlFor="status">Estado</label>
        <select
          id="status"
          name="status"
          value={filters.status}
          onChange={onFilterChange}
        >
          <option value="">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Confirmado">Confirmado</option>
          <option value="Finalizado">Finalizado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      <button className="turns-toolbar-button secondary" type="button" onClick={onClearFilters}>
        Limpiar filtros
      </button>
    </div>
  );
}

export default TurnsToolbar;