import { useState, useMemo, useEffect } from "react";

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

export function useTurns() {
  const [turns, setTurns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    // Simular carga de base de datos
    setIsLoading(true);
    const timer = setTimeout(() => {
      setTurns(initialTurns);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  function addTurn(newTurn) {
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

  function clearFilters() {
    setFilters(initialFilters);
  }

  function updateTurnStatus(turnId, nextStatus) {
    setTurns((prev) =>
      prev.map((turn) =>
        turn.id === turnId ? { ...turn, status: nextStatus } : turn
      )
    );
  }

  function deleteTurn(turnId) {
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

  return {
    turns,
    filteredTurns,
    filters,
    isLoading,
    addTurn,
    handleFilterChange,
    clearFilters,
    updateTurnStatus,
    deleteTurn,
  };
}
