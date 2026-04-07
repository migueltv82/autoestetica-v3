import { useState, useMemo } from "react";

const initialClients = [
  { id: 1, name: "Miguel Torres", phone: "3814400001", visits: 3, vehicle: "Auto", amount: "$ 45.000" },
  { id: 2, name: "Juan Pérez", phone: "3814400002", visits: 1, vehicle: "Camioneta", amount: "$ 20.000" },
  { id: 3, name: "Sofía Gómez", phone: "3814400003", visits: 5, vehicle: "Moto", amount: "$ 120.000" },
  { id: 4, name: "Lucas Alderete", phone: "3814400004", visits: 2, vehicle: "SUV", amount: "$ 35.000" },
];

export function useClients() {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState("");

  function addClient(newClient) {
    const formatMoney = (val) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(val);

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
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );
  }

  function deleteClient(id) {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  const filteredClients = useMemo(() => {
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
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
