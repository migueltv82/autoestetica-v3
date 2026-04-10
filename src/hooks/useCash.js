import { useEffect, useState } from "react";
import { getTodayString, shiftDateByDays } from "../utils/date";

const STORAGE_KEY = "autoestetica_cash";

function createInitialTransactions() {
  const today = getTodayString();
  const yesterday = shiftDateByDays(-1);

  return [
    { id: 1, date: today, description: "Lavado premium Juan Perez", type: "income", amount: 15000, method: "Transferencia" },
    { id: 2, date: today, description: "Compra de microfibras y shampoo", type: "expense", amount: 4500, method: "Efectivo" },
    { id: 3, date: yesterday, description: "Lavado completo Moto", type: "income", amount: 8000, method: "Efectivo" },
    { id: 4, date: yesterday, description: "Tratamiento acrilico SUV", type: "income", amount: 45000, method: "Transferencia" },
  ];
}

function loadInitialTransactions() {
  const fallbackTransactions = createInitialTransactions();

  if (typeof window === "undefined") {
    return fallbackTransactions;
  }

  try {
    const savedTransactions = localStorage.getItem(STORAGE_KEY);
    return savedTransactions ? JSON.parse(savedTransactions) : fallbackTransactions;
  } catch {
    return fallbackTransactions;
  }
}

export function useCash() {
  const [transactions, setTransactions] = useState(loadInitialTransactions);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // Ignore storage failures and keep the UI working.
    }
  }, [transactions]);

  function addTransaction(tx) {
    setTransactions((prev) => [
      {
        ...tx,
        id: Date.now(),
        date: getTodayString(),
        amount: Number(tx.amount),
      },
      ...prev,
    ]);
  }

  function updateTransaction(id, updatedTx) {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id ? { ...transaction, ...updatedTx, amount: Number(updatedTx.amount) } : transaction
      )
    );
  }

  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
  }

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
