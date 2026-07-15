import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

const STATUS_TO_DB = {
  Consulta: "inquiry", Pendiente: "pending", "Seña pendiente": "deposit_pending",
  Confirmado: "confirmed", "En proceso": "in_progress", Listo: "ready",
  Finalizado: "delivered", Cancelado: "cancelled", "No asistió": "no_show",
};
const STATUS_FROM_DB = Object.fromEntries(Object.entries(STATUS_TO_DB).map(([label, value]) => [value, label]));
const initialFilters = { search: "", date: "", status: "" };

function mapOrder(order) {
  const scheduled = order.scheduled_start ? new Date(order.scheduled_start) : null;
  const items = order.work_order_items || [];
  return {
    id: order.id,
    number: order.number,
    date: scheduled ? scheduled.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Tucuman" }) : "",
    time: scheduled ? scheduled.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Tucuman" }) : "---",
    client: order.clients?.name || "Sin cliente",
    clientId: order.client_id,
    phone: order.clients?.phone || "",
    vehicle: order.vehicles?.type || "Sin vehículo",
    vehicleId: order.vehicle_id,
    service: items.map((item) => item.description).join(", ") || "Sin servicios",
    services: items,
    status: STATUS_FROM_DB[order.status] || "Pendiente",
    notes: order.notes || "",
    amount: Number(order.total || 0),
  };
}

export function useTurns() {
  const { organizationId, user } = useAuth();
  const [turns, setTurns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setIsLoading(true);
    const { data, error: queryError } = await supabase.from("work_orders")
      .select("id,number,client_id,vehicle_id,status,scheduled_start,scheduled_end,notes,total,clients(name,phone),vehicles(type,brand,model,license_plate),work_order_items(id,description,quantity,unit_price,total,service_id)")
      .eq("organization_id", organizationId).is("deleted_at", null)
      .order("scheduled_start", { ascending: true, nullsFirst: false });
    if (queryError) setError(queryError.message);
    else { setTurns((data || []).map(mapOrder)); setError(""); }
    setIsLoading(false);
  }, [organizationId]);

  useEffect(() => {
    const timer = setTimeout(() => refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  async function addTurn(formData) {
    const normalizedPhone = formData.phone.replace(/\s/g, "");
    let { data: client } = await supabase.from("clients").select("id").eq("organization_id", organizationId).eq("phone", normalizedPhone).is("deleted_at", null).maybeSingle();
    if (!client) {
      const result = await supabase.from("clients").insert({ organization_id: organizationId, name: formData.client.trim(), phone: normalizedPhone }).select("id").single();
      if (result.error) throw result.error;
      client = result.data;
    }

    let { data: vehicle } = await supabase.from("vehicles").select("id").eq("organization_id", organizationId).eq("client_id", client.id).eq("type", formData.vehicle).is("deleted_at", null).limit(1).maybeSingle();
    if (!vehicle) {
      const result = await supabase.from("vehicles").insert({ organization_id: organizationId, client_id: client.id, type: formData.vehicle }).select("id").single();
      if (result.error) throw result.error;
      vehicle = result.data;
    }

    const start = `${formData.date}T${formData.time}:00-03:00`;
    const endDate = new Date(start);
    endDate.setHours(endDate.getHours() + 2);
    const { data: order, error: orderError } = await supabase.from("work_orders").insert({
      organization_id: organizationId, client_id: client.id, vehicle_id: vehicle.id,
      status: STATUS_TO_DB[formData.status] || "pending", scheduled_start: start,
      scheduled_end: endDate.toISOString(), notes: formData.notes || null, created_by: user.id,
    }).select("id").single();
    if (orderError) throw orderError;

    const orderItems = formData.services.map((service) => ({
      organization_id: organizationId, work_order_id: order.id, service_id: service.serviceId,
      description: service.name, quantity: 1, unit_price: Number(service.price || 0),
    }));
    const { error: itemError } = await supabase.from("work_order_items").insert(orderItems);
    if (itemError) throw itemError;

    const total = orderItems.reduce((sum, item) => sum + item.unit_price, 0);
    if (formData.registerPayment && total > 0) {
      const paymentMethods = { Efectivo: "cash", Transferencia: "transfer", Tarjeta: "credit", "Billetera virtual": "wallet" };
      const { data: payment, error: paymentError } = await supabase.from("payments").insert({
        organization_id: organizationId, work_order_id: order.id, client_id: client.id,
        amount: total, method: paymentMethods[formData.paymentMethod] || "other", kind: "payment", created_by: user.id,
      }).select("id").single();
      if (paymentError) throw paymentError;
      const { error: cashError } = await supabase.from("cash_movements").insert({
        organization_id: organizationId, payment_id: payment.id, work_order_id: order.id,
        type: "income", category: "Servicios", description: `${formData.client.trim()} · ${orderItems.map((item) => item.description).join(" + ")}`,
        amount: total, method: formData.paymentMethod, created_by: user.id,
      });
      if (cashError) throw cashError;
    }
    await refresh();
    return order;
  }

  async function updateTurnStatus(turnId, nextStatus) {
    const { error: updateError } = await supabase.from("work_orders").update({ status: STATUS_TO_DB[nextStatus] || "pending" })
      .eq("id", turnId).eq("organization_id", organizationId);
    if (updateError) throw updateError;
    setTurns((current) => current.map((turn) => turn.id === turnId ? { ...turn, status: nextStatus } : turn));
  }

  async function updateTurn(turnId, formData) {
    const current = turns.find((turn) => turn.id === turnId);
    if (!current) throw new Error("Turno no encontrado.");
    const clientResult = await supabase.from("clients").update({ name: formData.client.trim(), phone: formData.phone.replace(/\s/g, "") }).eq("id", current.clientId).eq("organization_id", organizationId);
    if (clientResult.error) throw clientResult.error;
    const vehicleResult = await supabase.from("vehicles").update({ type: formData.vehicle }).eq("id", current.vehicleId).eq("organization_id", organizationId);
    if (vehicleResult.error) throw vehicleResult.error;
    const start = `${formData.date}T${formData.time}:00-03:00`;
    const end = new Date(start); end.setHours(end.getHours() + 2);
    const orderResult = await supabase.from("work_orders").update({ status: STATUS_TO_DB[formData.status] || "pending", scheduled_start: start, scheduled_end: end.toISOString(), notes: formData.notes || null }).eq("id", turnId).eq("organization_id", organizationId);
    if (orderResult.error) throw orderResult.error;
    const removeResult = await supabase.from("work_order_items").delete().eq("work_order_id", turnId).eq("organization_id", organizationId);
    if (removeResult.error) throw removeResult.error;
    const items = formData.services.map((service) => ({ organization_id: organizationId, work_order_id: turnId, service_id: service.serviceId || null, description: service.name, quantity: 1, unit_price: Number(service.price || 0) }));
    const itemResult = await supabase.from("work_order_items").insert(items);
    if (itemResult.error) throw itemResult.error;
    await refresh();
  }

  async function deleteTurn(turnId) {
    if (!window.confirm("¿Querés eliminar esta orden de trabajo?")) return;
    const { error: deleteError } = await supabase.from("work_orders").update({ deleted_at: new Date().toISOString() })
      .eq("id", turnId).eq("organization_id", organizationId);
    if (deleteError) throw deleteError;
    setTurns((current) => current.filter((turn) => turn.id !== turnId));
  }

  function handleFilterChange(event) { const { name, value } = event.target; setFilters((current) => ({ ...current, [name]: value })); }
  function clearFilters() { setFilters(initialFilters); }

  const filteredTurns = useMemo(() => turns.filter((turn) => {
    const search = filters.search.trim().toLowerCase();
    return (!search || [turn.client, turn.service, turn.vehicle, turn.phone].some((value) => value.toLowerCase().includes(search)))
      && (!filters.date || turn.date === filters.date) && (!filters.status || turn.status === filters.status);
  }), [turns, filters]);

  return { turns, filteredTurns, filters, isLoading, error, refresh, addTurn, updateTurn, handleFilterChange, clearFilters, updateTurnStatus, deleteTurn };
}
