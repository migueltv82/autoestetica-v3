import { useState } from "react";

const initialTx = [
  { id: 1, date: "2026-03-25", description: "Lavado premium Juan Perez", type: "income", amount: 15000, method: "Transferencia" },
  { id: 2, date: "2026-03-25", description: "Compra de microfibras y shampoo", type: "expense", amount: 4500, method: "Efectivo" },
  { id: 3, date: "2026-03-24", description: "Lavado completo Moto", type: "income", amount: 8000, method: "Efectivo" },
  { id: 4, date: "2026-03-24", description: "Tratamiento Acrílico SUV", type: "income", amount: 45000, method: "Transferencia" },
];

export function useCash() {
  const [transactions, setTransactions] = useState(initialTx);

  function addTransaction(tx) {
    const today = new Date().toISOString().split("T")[0];
    setTransactions((prev) => [
      {
        ...tx,
        id: Date.now(),
        date: today,
        amount: Number(tx.amount), // ensure number
      },
      ...prev,
    ]);
  }

  function updateTransaction(id, updatedTx) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedTx, amount: Number(updatedTx.amount) } : t))
    );
  }

  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
