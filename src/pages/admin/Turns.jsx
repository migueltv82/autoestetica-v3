import { useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import TurnsToolbar from "../../components/admin/TurnsToolbar";
import TurnsTable from "../../components/admin/TurnsTable";
import TurnForm from "../../components/admin/TurnForm";

const initialTurns = [
  {
    id: 1,
    date: "2026-03-25",
    time: "10:00",
    client: "Juan Pérez",
    phone: "3815550001",
    vehicle: "Auto",
    service: "Lavado premium",
    status: "Pendiente",
    notes: "",
  },
  {
    id: 2,
    date: "2026-03-25",
    time: "12:00",
    client: "María López",
    phone: "3815550002",
    vehicle: "Camioneta",
    service: "Limpieza de interior",
    status: "Confirmado",
    notes: "",
  },
];

const initialFilters = {
  search: "",
  date: "",
  status: "",
};

function Turns() {
  const [turns, setTurns] = useState(initialTurns);
  const [filters, setFilters] = useState(initialFilters);

  function handleAddTurn(newTurn) {
    setTurns((prev) =>
      [newTurn, ...prev].sort((a, b) => {
        const aDateTime = `${a.date} ${a.time}`;
        const bDateTime = `${b.date} ${b.time}`;
        return aDateTime.localeCompare(bDateTime);
      })
    );
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleClearFilters() {
    setFilters(initialFilters);
  }

  function handleStatusChange(turnId, nextStatus) {
    setTurns((prev) =>
      prev.map((turn) =>
        turn.id === turnId ? { ...turn, status: nextStatus } : turn
      )
    );
  }

  function handleDeleteTurn(turnId) {
    const confirmed = window.confirm("¿Querés eliminar este turno?");
    if (!confirmed) return;

    setTurns((prev) => prev.filter((turn) => turn.id !== turnId));
  }

  const filteredTurns = useMemo(() => {
    return turns.filter((turn) => {
      const searchText = filters.search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        turn.client.toLowerCase().includes(searchText) ||
        turn.service.toLowerCase().includes(searchText) ||
        turn.vehicle.toLowerCase().includes(searchText) ||
        turn.phone.toLowerCase().includes(searchText);

      const matchesDate = !filters.date || turn.date === filters.date;
      const matchesStatus = !filters.status || turn.status === filters.status;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [turns, filters]);

  return (
    <AdminLayout
      title="Turnos"
      subtitle="Gestión interna de agenda y coordinación manual de citas."
    >
      <AdminPageHeader
        title="Agenda de turnos"
        subtitle={`Actualmente hay ${filteredTurns.length} turnos visibles en esta vista.`}
      />

      <TurnForm onAddTurn={handleAddTurn} />

      <TurnsToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <TurnsTable
        turns={filteredTurns}
        onStatusChange={handleStatusChange}
        onDeleteTurn={handleDeleteTurn}
      />
    </AdminLayout>
  );
}

export default Turns;