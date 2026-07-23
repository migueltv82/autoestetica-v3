import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { useRealtimeRefresh } from "./useRealtimeRefresh";
import { usePermissions } from "./usePermissions";

const CASH_REALTIME_TABLES = ["work_orders", "work_order_items", "payments", "cash_movements", "receipts"];

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
    paymentId: movement.payment_id,
  };
}

export function useCash() {
  const { organizationId, user } = useAuth();
  const { canManageFinance } = usePermissions();
  const [transactions, setTransactions] = useState([]);
  const [receivables, setReceivables] = useState([]);
  const [closures, setClosures] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async (options = {}) => {
    if (!organizationId) return;
    if (!canManageFinance) {
      setTransactions([]);
      setReceivables([]);
      setClosures([]);
      setReceipts([]);
      setError("");
      setIsLoading(false);
      return;
    }
    if (!options.silent) setIsLoading(true);
    const [movementResult, orderResult, closureResult, receiptResult] = await Promise.all([
      supabase.from("cash_movements").select("id,occurred_at,description,type,amount,method,category,work_order_id,payment_id").eq("organization_id", organizationId).is("voided_at", null).order("occurred_at", { ascending: false }),
      supabase.from("work_orders").select("id,number,status,total,scheduled_start,client_id,clients(name,phone),vehicles(type),work_order_items(total),payments(amount,kind,voided_at)").eq("organization_id", organizationId).is("deleted_at", null).not("status", "in", "(cancelled,no_show)").order("scheduled_start", { ascending: false }),
      supabase.from("cash_closures").select("*").eq("organization_id", organizationId).order("closure_date", { ascending: false }).limit(31),
      supabase.from("receipts").select("id,number,total,payment_status,issued_at,work_order_id,clients(name,phone),work_orders(scheduled_start,scheduled_end,vehicles(type),work_order_items(id,description,quantity,unit_price,total,service_id))").eq("organization_id", organizationId).eq("status", "issued").order("issued_at", { ascending: false }).limit(50),
    ]);
    const closureError = closureResult.error && !["PGRST205", "42P01"].includes(closureResult.error.code) ? closureResult.error : null;
    const queryError = movementResult.error || orderResult.error || closureError || receiptResult.error;
    if (queryError) setError(queryError.message);
    else {
      setTransactions((movementResult.data || []).map(mapMovement));
      setClosures(closureResult.data || []);
      setReceipts((receiptResult.data || []).map((receipt) => { const start = receipt.work_orders?.scheduled_start ? new Date(receipt.work_orders.scheduled_start) : null; const end = receipt.work_orders?.scheduled_end ? new Date(receipt.work_orders.scheduled_end) : null; const items = receipt.work_orders?.work_order_items || []; return { receiptId: receipt.id, receiptNumber: receipt.number, id: receipt.work_order_id, client: receipt.clients?.name || "Sin cliente", phone: receipt.clients?.phone || "", vehicle: receipt.work_orders?.vehicles?.type || "Vehículo", date: start ? start.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Tucuman" }) : "", time: start ? start.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Tucuman" }) : "", endTime: end ? end.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Tucuman" }) : "", service: items.map((item) => item.description).join(", "), services: items, amount: Number(receipt.total || 0), paymentStatus: receipt.payment_status, issuedAt: receipt.issued_at }; }));
      setReceivables((orderResult.data || []).map((order) => {
        const itemsTotal = (order.work_order_items || []).reduce((sum, item) => sum + Number(item.total || 0), 0);
        const total = Number(order.total || 0) || itemsTotal;
        const paid = (order.payments || []).filter((payment) => !payment.voided_at).reduce((sum, payment) => sum + (payment.kind === "refund" ? -Number(payment.amount) : Number(payment.amount)), 0);
        return { id: order.id, number: order.number, clientId: order.client_id, client: order.clients?.name || "Sin cliente", phone: order.clients?.phone || "", vehicle: order.vehicles?.type || "Vehículo", date: order.scheduled_start ? new Date(order.scheduled_start).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Tucuman" }) : "", total, paid, balance: Math.max(total - paid, 0) };
      }).filter((order) => order.total > 0 && order.balance > 0));
      setError("");
    }
    setIsLoading(false);
  }, [organizationId, canManageFinance]);

  useEffect(() => {
    const timer = setTimeout(() => refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);
  const realtimeTables = useMemo(() => (canManageFinance ? CASH_REALTIME_TABLES : []), [canManageFinance]);
  useRealtimeRefresh(organizationId, realtimeTables, refresh);

  async function addTransaction(transaction) {
    if (!canManageFinance) throw new Error("No tenes permiso para administrar caja.");
    const { error: insertError } = await supabase.from("cash_movements").insert({
      organization_id: organizationId,
      type: transaction.type,
      category: transaction.category || (transaction.type === "income" ? "Servicios" : "Gastos operativos"),
      description: transaction.description.trim(),
      amount: Number(transaction.amount),
      method: transaction.method,
      occurred_at: transaction.date ? `${transaction.date}T12:00:00-03:00` : undefined,
      work_order_id: transaction.workOrderId || null,
      created_by: user.id,
    });
    if (insertError) throw insertError;
    await refresh();
  }

  async function updateTransaction(id, transaction) {
    if (!canManageFinance) throw new Error("No tenes permiso para administrar caja.");
    const { error: updateError } = await supabase.from("cash_movements").update({
      type: transaction.type,
      category: transaction.category || (transaction.type === "income" ? "Servicios" : "Gastos operativos"),
      description: transaction.description.trim(),
      amount: Number(transaction.amount),
      method: transaction.method,
      occurred_at: transaction.date ? `${transaction.date}T12:00:00-03:00` : undefined,
    }).eq("id", id).eq("organization_id", organizationId).is("voided_at", null);
    if (updateError) throw updateError;
    await refresh();
  }

  async function deleteTransaction(id) {
    if (!canManageFinance) throw new Error("No tenes permiso para administrar caja.");
    const { error: voidError } = await supabase.from("cash_movements").update({
      voided_at: new Date().toISOString(), void_reason: "Anulado desde el panel",
    }).eq("id", id).eq("organization_id", organizationId);
    if (voidError) throw voidError;
    await refresh();
  }

  async function collectPayment(order, amount, method) {
    if (!canManageFinance) throw new Error("No tenes permiso para registrar cobros.");
    const value = Number(amount);
    if (!value || value <= 0) throw new Error("Ingresá un importe válido.");
    if (value > order.balance) throw new Error("El cobro no puede superar el saldo pendiente.");
    const methods = { Efectivo: "cash", Transferencia: "transfer", Débito: "debit", Crédito: "credit", "Billetera virtual": "wallet" };
    const { data: payment, error: paymentError } = await supabase.from("payments").insert({ organization_id: organizationId, work_order_id: order.id, client_id: order.clientId, amount: value, method: methods[method] || "other", kind: order.paid > 0 ? "payment" : value < order.total ? "deposit" : "payment", created_by: user.id }).select("id").single();
    if (paymentError) throw paymentError;
    const { error: movementError } = await supabase.from("cash_movements").insert({ organization_id: organizationId, payment_id: payment.id, work_order_id: order.id, type: "income", category: order.paid > 0 ? "Saldo de servicio" : value < order.total ? "Seña" : "Servicios", description: `${order.client} · Orden #${order.number}`, amount: value, method, created_by: user.id });
    if (movementError) {
      await supabase.from("payments").update({ voided_at: new Date().toISOString(), void_reason: "No se pudo generar el movimiento de caja" }).eq("id", payment.id);
      throw movementError;
    }
    await refresh();
  }

  async function closeDay({ date, incomes, expenses, count, notes }) {
    if (!canManageFinance) throw new Error("No tenes permiso para cerrar caja.");
    const { error: closeError } = await supabase.from("cash_closures").insert({ organization_id: organizationId, closure_date: date, income_total: incomes, expense_total: expenses, balance_total: incomes - expenses, movement_count: count, notes: notes || null, closed_by: user.id });
    if (closeError?.code === "23505") throw new Error("Ese día ya tiene un cierre registrado.");
    if (closeError) throw closeError;
    await refresh();
  }

  return { transactions, receivables, closures, receipts, isLoading, error, refresh, addTransaction, updateTransaction, deleteTransaction, collectPayment, closeDay };
}
