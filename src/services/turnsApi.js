import { supabase } from "../lib/supabase";
import { stampFidelityCardForClient } from "./fidelityApi";

export const TURN_REALTIME_TABLES = ["work_orders", "work_order_items"];
export const FINANCE_TURN_REALTIME_TABLES = ["payments", "cash_movements", "receipts"];

export const STATUS_TO_DB = {
  Consulta: "inquiry",
  Pendiente: "pending",
  "Seña pendiente": "deposit_pending",
  Confirmado: "confirmed",
  "En proceso": "in_progress",
  Listo: "ready",
  Finalizado: "delivered",
  Cancelado: "cancelled",
  "No asistió": "no_show",
};

export const STATUS_FROM_DB = Object.fromEntries(
  Object.entries(STATUS_TO_DB).map(([label, value]) => [value, label])
);

export function mapWorkOrder(order) {
  const scheduled = order.scheduled_start ? new Date(order.scheduled_start) : null;
  const scheduledEnd = order.scheduled_end ? new Date(order.scheduled_end) : null;
  const items = order.work_order_items || [];

  return {
    id: order.id,
    number: order.number,
    date: scheduled ? scheduled.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Tucuman" }) : "",
    endDate: scheduledEnd ? scheduledEnd.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Tucuman" }) : "",
    lastOccupiedDate: scheduledEnd ? new Date(scheduledEnd.getTime() - 1).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Tucuman" }) : "",
    time: scheduled ? scheduled.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Tucuman" }) : "---",
    endTime: scheduledEnd ? scheduledEnd.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Tucuman" }) : "---",
    durationMinutes: scheduled && scheduledEnd ? Math.max(15, Math.round((scheduledEnd - scheduled) / 60000)) : 120,
    client: order.clients?.name || "Sin cliente",
    clientId: order.client_id,
    phone: order.clients?.phone || "",
    vehicle: order.vehicles?.type || "Sin vehículo",
    vehicleBrand: order.vehicles?.brand || "",
    vehicleModel: order.vehicles?.model || "",
    vehicleId: order.vehicle_id,
    service: items.map((item) => item.description).join(", ") || "Sin servicios",
    services: items,
    status: STATUS_FROM_DB[order.status] || "Pendiente",
    notes: order.notes || "",
    amount: Number(order.total || 0),
  };
}

export function buildTurnSchedule(formData) {
  const start = `${formData.date}T${formData.time}:00-03:00`;
  const explicitEnd = formData.endDate && formData.endTime ? new Date(`${formData.endDate}T${formData.endTime}:00-03:00`) : null;
  const end = explicitEnd || new Date(start);
  if (!explicitEnd) end.setMinutes(end.getMinutes() + Math.max(15, Number(formData.durationMinutes) || 120));
  if (end <= new Date(start)) throw new Error("La finalización debe ser posterior al inicio del trabajo.");
  return { start, end };
}

export function buildTurnItems(formData) {
  return formData.services.map((service) => ({
    serviceId: service.serviceId || null,
    name: service.name,
    price: Number(service.price || 0),
  }));
}

function mapPaymentMethod(method) {
  const paymentMethods = {
    Efectivo: "cash",
    Transferencia: "transfer",
    Tarjeta: "credit",
    "Billetera virtual": "wallet",
  };
  return paymentMethods[method] || "other";
}

async function saveVehicleDetails(orderId, formData) {
  const { data: order, error: orderError } = await supabase.from("work_orders").select("vehicle_id").eq("id", orderId).single();
  if (orderError) throw orderError;
  if (!order?.vehicle_id) return;
  const { error: vehicleError } = await supabase.from("vehicles").update({
    brand: formData.vehicleBrand?.trim() || null,
    model: formData.vehicleModel?.trim() || null,
  }).eq("id", order.vehicle_id);
  if (vehicleError) throw vehicleError;
}

export async function fetchTurns(organizationId) {
  const { data, error } = await supabase.from("work_orders")
    .select("id,number,client_id,vehicle_id,status,scheduled_start,scheduled_end,notes,total,clients(name,phone),vehicles(type,brand,model,license_plate),work_order_items(id,description,quantity,unit_price,total,service_id,services(estimated_minutes))")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("scheduled_start", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data || []).map(mapWorkOrder);
}

export async function ensureTurnScheduleAvailable({ organizationId, start, end, excludedTurnId = null }) {
  const { data: blocks, error: blockError } = await supabase.from("schedule_blocks")
    .select("reason,starts_at,ends_at")
    .eq("organization_id", organizationId)
    .lt("starts_at", end.toISOString())
    .gt("ends_at", start)
    .limit(1);
  if (blockError && blockError.code !== "PGRST205" && blockError.code !== "42P01") throw blockError;
  if (blocks?.length) throw new Error(`Ese horario no está disponible: ${blocks[0].reason || "agenda bloqueada"}.`);

  let query = supabase.from("work_orders")
    .select("id,scheduled_start,scheduled_end,clients(name)")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .neq("status", "cancelled")
    .lt("scheduled_start", end.toISOString())
    .gt("scheduled_end", start);

  if (excludedTurnId) query = query.neq("id", excludedTurnId);

  const { data, error } = await query.limit(1);
  if (error) throw error;
  if (data?.length) {
    const occupied = data[0];
    const options = { hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Tucuman" };
    const from = new Date(occupied.scheduled_start).toLocaleTimeString("es-AR", options);
    const to = new Date(occupied.scheduled_end).toLocaleTimeString("es-AR", options);
    throw new Error(`Horario ocupado por ${occupied.clients?.name || "otro cliente"} (${from} a ${to}).`);
  }
}

export async function createScheduledTurn({ formData, phone }) {
  const { start, end } = buildTurnSchedule(formData);
  const orderItems = buildTurnItems(formData);
  const total = orderItems.reduce((sum, item) => sum + item.price, 0);

  const { data: orderId, error } = await supabase.rpc("create_scheduled_work_order", {
    p_client_name: formData.client.trim(),
    p_phone: phone,
    p_vehicle_type: formData.vehicle,
    p_status: STATUS_TO_DB[formData.status] || "pending",
    p_scheduled_start: start,
    p_scheduled_end: end.toISOString(),
    p_notes: formData.notes || null,
    p_services: orderItems,
    p_register_payment: Boolean(formData.registerPayment),
    p_payment_method: mapPaymentMethod(formData.paymentMethod),
    p_cash_method: formData.paymentMethod,
  });
  if (error) throw error;
  await saveVehicleDetails(orderId, formData);

  return {
    id: orderId,
    date: formData.date,
    endDate: formData.endDate || end.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Tucuman" }),
    time: formData.time,
    endTime: end.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Tucuman" }),
    client: formData.client.trim(),
    phone,
    vehicle: formData.vehicle,
    vehicleBrand: formData.vehicleBrand?.trim() || "",
    vehicleModel: formData.vehicleModel?.trim() || "",
    service: orderItems.map((item) => item.name).join(", "),
    services: orderItems,
    status: formData.status,
    amount: total,
  };
}

export async function updateScheduledTurn({ turnId, formData, phone }) {
  const { start, end } = buildTurnSchedule(formData);
  const items = buildTurnItems(formData);

  const { error } = await supabase.rpc("update_scheduled_work_order", {
    p_order_id: turnId,
    p_client_name: formData.client.trim(),
    p_phone: phone,
    p_vehicle_type: formData.vehicle,
    p_status: STATUS_TO_DB[formData.status] || "pending",
    p_scheduled_start: start,
    p_scheduled_end: end.toISOString(),
    p_notes: formData.notes || null,
    p_services: items,
  });
  if (error) throw error;
  await saveVehicleDetails(turnId, formData);
}

export async function saveTurnStatus({ turnId, status }) {
  const dbStatus = STATUS_TO_DB[status] || "pending";
  const { error } = await supabase.rpc("set_work_order_status", {
    p_order_id: turnId,
    p_status: dbStatus,
  });
  if (error) throw error;

  let fidelityResult = null;
  if (dbStatus === "delivered") {
    try {
      const { data: order } = await supabase
        .from("work_orders")
        .select("client_id")
        .eq("id", turnId)
        .single();

      if (order?.client_id) {
        fidelityResult = await stampFidelityCardForClient(order.client_id, turnId, "Vehículo entregado");
      }
    } catch (err) {
      console.warn("No se pudo estampar troquel Fidelity:", err);
    }
  }

  return fidelityResult;
}

export async function voidTurn(turnId) {
  const { error } = await supabase.rpc("void_work_order", { target_order: turnId });
  if (error) throw error;
}
