import "./skeleton.css";

function TurnsTableSkeleton() {
  return (
    <div className="table-responsive skeleton-anim">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Fecha y Hora</th>
            <th>Cliente</th>
            <th>Vehículo</th>
            <th>Servicio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              <td><div className="skeleton-line" style={{width: "70%"}}></div></td>
              <td><div className="skeleton-line"></div></td>
              <td><div className="skeleton-line" style={{width: "50%"}}></div></td>
              <td><div className="skeleton-line" style={{width: "80%"}}></div></td>
              <td><div className="skeleton-badge"></div></td>
              <td><div className="skeleton-badge" style={{width: "60px"}}></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TurnsTableSkeleton;
