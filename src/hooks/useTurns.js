import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { useFeedback } from "./useFeedback";
import { usePermissions } from "./usePermissions";
import { useRealtimeRefresh } from "./useRealtimeRefresh";
import { normalizeStoredArgentinaPhone } from "../utils/whatsapp";

const TURN_REALTIME_TABLES = ["work_orders", "work_order_items"];
const FINANCE_TURN_REALTIME_TABLES = ["payments", "cash_movements", "receipts"];

const STATUS_TO_DB = {
  Consulta: "inquiry", Pendiente: "pending", "Seña pendiente": "deposit_pending",
  Confirmado: "confirmed", "En proceso": "in_progress", Listo: "ready",
  Finalizado: "delivered", Cancelado: "cancelled", "No asistió": "no_show",
};
const STATUS_FROM_DB = Object.fromEntries(Object.entries(STATUS_TO_DB).map(([label, value]) => [value, label]));
const initialFilters = { search: "", date: "", status: "" };

function mapOrder(order) {
  const scheduled = order.scheduled_start ? new Date(order.scheduled_start) : null;
  const scheduledEnd = order.scheduled_end ? new Date(order.scheduled_end) : null;
  const items = order.work_order_items || [];
  return {
    id: order.id,
    number: order.number,
    date: scheduled ? scheduled.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Tucuman" }) : "",
    time: scheduled ? scheduled.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Tucuman" }) : "---",
    endTime: scheduledEnd ? scheduledEnd.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Tucuman" }) : "---",
    durationMinutes: scheduled && scheduledEnd ? Math.max(15, Math.round((scheduledEnd - scheduled) / 60000)) : 120,
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
  const { confirm, notify } = useFeedback();
  const { canManageFinance, canManageTurns, canDeleteTurns } = usePermissions();
  const [turns, setTurns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  const refresh = useCallback(async (options = {}) => {
    if (!organizationId) return;
    if (!options.silent) setIsLoading(true);
    const { data, error: queryError } = await supabase.from("work_orders")
      .select("id,number,client_id,vehicle_id,status,scheduled_start,scheduled_end,notes,total,clients(name,phone),vehicles(type,brand,model,license_plate),work_order_items(id,description,quantity,unit_price,total,service_id,services(estimated_minutes))")
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
  const realtimeTables = useMemo(
    () => (canManageFinance ? [...TURN_REALTIME_TABLES, ...FINANCE_TURN_REALTIME_TABLES] : TURN_REALTIME_TABLES),
    [canManageFinance],
  );
  useRealtimeRefresh(organizationId, realtimeTables, refresh);

  async function addTurn(formData) {
    if (!canManageTurns) throw new Error("No tenes permiso para crear turnos.");
    if (!organizationId || !user?.id) throw new Error("La sesión no está lista. Volvé a ingresar.");
    if (!formData.services?.length) throw new Error("Seleccioná al menos un servicio.");
    const { start, end } = getSchedule(formData);
    await ensureScheduleAvailable(start, end);
    const normalizedPhone = normalizeStoredArgentinaPhone(formData.phone);
    if (normalizedPhone.length < 8) throw new Error("Ingresá un número de WhatsApp válido.");
    const orderItems = formData.services.map((service) => ({
      serviceId: service.serviceId, name: service.name, price: Number(service.price || 0),
    }));
    const total = orderItems.reduce((sum, item) => sum + item.price, 0);
    const paymentMethods = { Efectivo: "cash", Transferencia: "transfer", Tarjeta: "credit", "Billetera virtual": "wallet" };
    const { data: orderId, error: createError } = await supabase.rpc("create_scheduled_work_order", {
      p_client_name: formData.client.trim(), p_phone: normalizedPhone, p_vehicle_type: formData.vehicle,
      p_status: STATUS_TO_DB[formData.status] || "pending", p_scheduled_start: start,
      p_scheduled_end: end.toISOString(), p_notes: formData.notes || null, p_services: orderItems,
      p_register_payment: Boolean(formData.registerPayment), p_payment_method: paymentMethods[formData.paymentMethod] || "other",
      p_cash_method: formData.paymentMethod,
    });
    if (createError) throw createError;
    await refresh();
    return { id: orderId, date: formData.date, time: formData.time, endTime: end.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Tucuman" }), client: formData.client.trim(), phone: normalizedPhone, vehicle: formData.vehicle, service: orderItems.map((item) => item.name).join(", "), services: orderItems, status: formData.status, amount: total };
  }

  async function updateTurnStatus(turnId, nextStatus) {
    if (!canManageTurns) throw new Error("No tenes permiso para cambiar el estado del turno.");
    const { error: updateError } = await supabase.rpc("set_work_order_status", {
      p_order_id: turnId,
      p_status: STATUS_TO_DB[nextStatus] || "pending",
    });
    if (updateError) throw updateError;
    setTurns((current) => current.map((turn) => turn.id === turnId ? { ...turn, status: nextStatus } : turn));
  }

  async function updateTurn(turnId, formData) {
    if (!canManageTurns) throw new Error("No tenes permiso para modificar turnos.");
    const current = turns.find((turn) => turn.id === turnId);
    if (!current) throw new Error("Turno no encontrado.");
    if (!formData.services?.length) throw new Error("Seleccioná al menos un servicio.");
    const normalizedPhone = normalizeStoredArgentinaPhone(formData.phone);
    if (normalizedPhone.length < 8) throw new Error("Ingresá un número de WhatsApp válido.");
    const { start, end } = getSchedule(formData);
    const items = formData.services.map((service) => ({ serviceId: service.serviceId || null, name: service.name, price: Number(service.price || 0) }));
    const { error: updateError } = await supabase.rpc("update_scheduled_work_order", {
      p_order_id: turnId, p_client_name: formData.client.trim(), p_phone: normalizedPhone,
      p_vehicle_type: formData.vehicle, p_status: STATUS_TO_DB[formData.status] || "pending",
      p_scheduled_start: start, p_scheduled_end: end.toISOString(), p_notes: formData.notes || null,
      p_services: items,
    });
    if (updateError) throw updateError;
    await refresh();
  }

  function getSchedule(formData) {
    const start = `${formData.date}T${formData.time}:00-03:00`;
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + Math.max(15, Number(formData.durationMinutes) || 120));
    return { start, end };
  }

  async function ensureScheduleAvailable(start, end, excludedTurnId = null) {
    const { data: blocks, error: blockError } = await supabase.from("schedule_blocks")
      .select("reason,starts_at,ends_at").eq("organization_id", organizationId)
      .lt("starts_at", end.toISOString()).gt("ends_at", start).limit(1);
    if (blockError && blockError.code !== "PGRST205" && blockError.code !== "42P01") throw blockError;
    if (blocks?.length) throw new Error(`Ese horario no está disponible: ${blocks[0].reason || "agenda bloqueada"}.`);

    let query = supabase.from("work_orders").select("id,scheduled_start,scheduled_end,clients(name)")
      .eq("organization_id", organizationId).is("deleted_at", null).neq("status", "cancelled")
      .lt("scheduled_start", end.toISOString()).gt("scheduled_end", start);
    if (excludedTurnId) query = query.neq("id", excludedTurnId);
    const { data, error: conflictError } = await query.limit(1);
    if (conflictError) throw conflictError;
    if (data?.length) {
      const occupied = data[0];
      const options = { hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Tucuman" };
      const from = new Date(occupied.scheduled_start).toLocaleTimeString("es-AR", options);
      const to = new Date(occupied.scheduled_end).toLocaleTimeString("es-AR", options);
      throw new Error(`Horario ocupado por ${occupied.clients?.name || "otro cliente"} (${from} a ${to}).`);
    }
  }

  async function deleteTurn(turnId) {
    if (!canDeleteTurns) throw new Error("No tenes permiso para eliminar turnos.");
    const accepted = await confirm({ title: "Eliminar turno definitivamente", message: "Se eliminarán el turno, sus ingresos, pagos y recibo. El cliente y su vehículo se conservarán. Esta acción no se puede deshacer.", confirmLabel: "Eliminar todo" });
    if (!accepted) return;
    const { error: deleteError } = await supabase.rpc("void_work_order", { target_order: turnId });
    if (deleteError) throw deleteError;
    setTurns((current) => current.filter((turn) => turn.id !== turnId));
    notify("Turno eliminado correctamente.", "success");
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
