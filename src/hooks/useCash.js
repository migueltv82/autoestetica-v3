import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

function mapMovement(movement) {
  return {
    id: movement.id,
    date: new Date(movement.occurred_at).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Tucuman" }),
    description: movement.description,
    type: movement.type,
    amount: Number(movement.amount),
    method: movement.method,
    category: movement.category,
    workOrderId: movement.work_order_id,
  };
}

export function useCash() {
  const { organizationId, user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setIsLoading(true);
    const { data, error: queryError } = await supabase.from("cash_movements")
      .select("id,occurred_at,description,type,amount,method,category,work_order_id")
      .eq("organization_id", organizationId).is("voided_at", null)
      .order("occurred_at", { ascending: false });
    if (queryError) setError(queryError.message);
    else { setTransactions((data || []).map(mapMovement)); setError(""); }
    setIsLoading(false);
  }, [organizationId]);

  useEffect(() => {
    const timer = setTimeout(() => refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  async function addTransaction(transaction) {
    const { error: insertError } = await supabase.from("cash_movements").insert({
      organization_id: organizationId,
      type: transaction.type,
      category: transaction.category || (transaction.type === "income" ? "Servicios" : "Gastos operativos"),
      description: transaction.description.trim(),
      amount: Number(transaction.amount),
      method: transaction.method,
      work_order_id: transaction.workOrderId || null,
      created_by: user.id,
    });
    if (insertError) throw insertError;
    await refresh();
  }

  async function updateTransaction(id, transaction) {
    const { error: updateError } = await supabase.from("cash_movements").update({
      type: transaction.type,
      category: transaction.category || (transaction.type === "income" ? "Servicios" : "Gastos operativos"),
      description: transaction.description.trim(),
      amount: Number(transaction.amount),
      method: transaction.method,
    }).eq("id", id).eq("organization_id", organizationId).is("voided_at", null);
    if (updateError) throw updateError;
    await refresh();
  }

  async function deleteTransaction(id) {
    const { error: voidError } = await supabase.from("cash_movements").update({
      voided_at: new Date().toISOString(), void_reason: "Anulado desde el panel",
    }).eq("id", id).eq("organization_id", organizationId);
    if (voidError) throw voidError;
    await refresh();
  }

  return { transactions, isLoading, error, refresh, addTransaction, updateTransaction, deleteTransaction };
}
