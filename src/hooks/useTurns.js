import { useState, useMemo, useEffect } from "react";
import { createDemoTurns } from "../data/demoTurns";

const STORAGE_KEY = "turns";

const initialFilters = {
  search: "",
  date: "",
  status: "",
};

function loadInitialTurns() {
  const fallbackTurns = createDemoTurns();

  if (typeof window === "undefined") {
    return fallbackTurns;
  }

  try {
    const savedTurns = localStorage.getItem(STORAGE_KEY);
    return savedTurns ? JSON.parse(savedTurns) : fallbackTurns;
  } catch {
    return fallbackTurns;
  }
}

export function useTurns() {
  const [turns, setTurns] = useState(loadInitialTurns);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(turns));
    } catch {
      // Keep the UI responsive even if storage is unavailable.
    }
  }, [turns]);

  function addTurn(newTurn) {
    setTurns((prev) =>
      [newTurn, ...prev].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
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
    setTurns((prev) => prev.map((turn) => (turn.id === turnId ? { ...turn, status: nextStatus } : turn)));
  }

  function deleteTurn(turnId) {
    const confirmed = window.confirm("Queres eliminar este turno?");
    if (!confirmed) {
      return;
    }

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
