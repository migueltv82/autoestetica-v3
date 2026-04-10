import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "autoestetica_clients";

const initialClients = [
  { id: 1, name: "Miguel Torres", phone: "3814400001", visits: 3, vehicle: "Auto", amount: "$ 45.000" },
  { id: 2, name: "Juan Perez", phone: "3814400002", visits: 1, vehicle: "Camioneta", amount: "$ 20.000" },
  { id: 3, name: "Sofia Gomez", phone: "3814400003", visits: 5, vehicle: "Moto", amount: "$ 120.000" },
  { id: 4, name: "Lucas Alderete", phone: "3814400004", visits: 2, vehicle: "SUV", amount: "$ 35.000" },
];

function loadInitialClients() {
  if (typeof window === "undefined") {
    return initialClients;
  }

  try {
    const savedClients = localStorage.getItem(STORAGE_KEY);
    return savedClients ? JSON.parse(savedClients) : initialClients;
  } catch {
    return initialClients;
  }
}

export function useClients() {
  const [clients, setClients] = useState(loadInitialClients);
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch {
      // Ignore storage failures and keep the UI working.
    }
  }, [clients]);

  function addClient(newClient) {
    const formatMoney = (value) =>
      new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(value);

    setClients((prev) => [
      ...prev,
      {
        ...newClient,
        id: Date.now(),
        visits: 0,
        amount: formatMoney(0),
      },
    ]);
  }

  function updateClient(id, updatedData) {
    setClients((prev) => prev.map((client) => (client.id === id ? { ...client, ...updatedData } : client)));
  }

  function deleteClient(id) {
    setClients((prev) => prev.filter((client) => client.id !== id));
  }

  const filteredClients = useMemo(() => {
    const query = search.toLowerCase();

    return clients.filter(
      (client) => client.name.toLowerCase().includes(query) || client.phone.includes(search)
    );
  }, [clients, search]);

  return {
    clients: filteredClients,
    totalClients: clients.length,
    search,
    setSearch,
    addClient,
    updateClient,
    deleteClient,
  };
}
