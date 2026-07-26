import { supabase } from "../lib/supabase";
import { ensureFidelityCardForClient, stampFidelityCardForClient } from "./fidelityApi";

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
  const clientVehicles = (order.clients?.vehicles || []).filter((vehicle) => !vehicle.deleted_at);
  const fileVehicle = clientVehicles.find((vehicle) => vehicle.id === order.vehicle_id && (vehicle.brand || vehicle.model))
    || clientVehicles.find((vehicle) => vehicle.brand || vehicle.model);

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
    clientDirectoryVisible: order.clients?.directory_visible !== false,
    phone: order.clients?.phone || "",
    vehicle: order.vehicles?.type || "Sin vehículo",
    vehicleBrand: order.vehicles?.brand || fileVehicle?.brand || "",
    vehicleModel: order.vehicles?.model || fileVehicle?.model || "",
    vehicleId: order.vehicle_id,
    service: items.map((item) => item.description).join(", ") || "Sin servicios",
    services: items,
    status: STATUS_FROM_DB[order.status] || "Pendiente",
    notes: order.notes || "",
    inquiryReadAt: order.inquiry_read_at || null,
    discount: Number(order.discount || 0),
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

async function syncClientDirectoryPreference(orderId, previousClient, saveClient) {
  if (previousClient?.directory_visible && !saveClient) return;
  if (previousClient && !saveClient) return;
  const { error } = await supabase.rpc("set_order_client_directory_visibility", {
    p_order_id: orderId,
    p_visible: Boolean(saveClient),
  });
  if (error) throw error;
}

export async function fetchTurns(organizationId) {
  const { data, error } = await supabase.from("work_orders")
    .select("id,number,client_id,vehicle_id,status,scheduled_start,scheduled_end,notes,inquiry_read_at,discount,total,clients(name,phone,directory_visible,vehicles(id,brand,model,deleted_at)),vehicles(type,brand,model,license_plate),work_order_items(id,description,quantity,unit_price,total,service_id,services(estimated_minutes))")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("scheduled_start", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data || []).map(mapWorkOrder);
}

export async function markInquiryAsRead(turnId) {
  const { error } = await supabase.rpc("mark_inquiry_read", { p_order_id: turnId });
  if (error) throw error;
}

export async function ensureTurnScheduleAvailable({ organizationId, start, end }) {
  const { data: blocks, error: blockError } = await supabase.from("schedule_blocks")
    .select("reason,starts_at,ends_at")
    .eq("organization_id", organizationId)
    .lt("starts_at", end.toISOString())
    .gt("ends_at", start.toISOString())
    .limit(1);
  if (blockError && blockError.code !== "PGRST205" && blockError.code !== "42P01") throw blockError;
  if (blocks?.length) throw new Error(`Ese horario no está disponible: ${blocks[0].reason || "agenda bloqueada"}.`);
}

export async function createScheduledTurn({ formData, phone }) {
  const { start, end } = buildTurnSchedule(formData);
  const orderItems = buildTurnItems(formData);
  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const discount = Math.min(Math.max(Number(formData.discount || 0), 0), subtotal);
  const total = Math.max(subtotal - discount, 0);
  const { data: previousClient, error: clientLookupError } = await supabase
    .from("clients")
    .select("id,directory_visible")
    .eq("phone", phone)
    .is("deleted_at", null)
    .maybeSingle();
  if (clientLookupError) throw clientLookupError;

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
  const { error: discountError } = await supabase.rpc("set_work_order_discount", {
    p_order_id: orderId,
    p_discount: discount,
    p_adjust_initial_payment: Boolean(formData.registerPayment),
  });
  if (discountError) throw discountError;
  await syncClientDirectoryPreference(orderId, previousClient, formData.saveClient !== false);
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
    discount,
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
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const { error: discountError } = await supabase.rpc("set_work_order_discount", {
    p_order_id: turnId,
    p_discount: Math.min(Math.max(Number(formData.discount || 0), 0), subtotal),
    p_adjust_initial_payment: false,
  });
  if (discountError) throw discountError;
  await saveVehicleDetails(turnId, formData);
  if (formData.saveClient) {
    const { error: promotionError } = await supabase.rpc("promote_order_client_with_fidelity", {
      p_order_id: turnId,
      p_generate_card: formData.status === "Confirmado",
    });
    if (promotionError) throw promotionError;
  }
}

export async function saveTurnStatus({ turnId, status }) {
  const dbStatus = STATUS_TO_DB[status] || "pending";
  const { error } = await supabase.rpc("set_work_order_status", {
    p_order_id: turnId,
    p_status: dbStatus,
  });
  if (error) throw error;

  let fidelityResult = null;
  if (["confirmed", "delivered"].includes(dbStatus)) {
    try {
      const { data: order } = await supabase
        .from("work_orders")
        .select("client_id,vehicle_id")
        .eq("id", turnId)
        .single();

      if (order?.client_id) {
        fidelityResult = dbStatus === "confirmed"
          ? { ...await ensureFidelityCardForClient(order.client_id, order.vehicle_id), confirmationReady: true }
          : await stampFidelityCardForClient(order.client_id, order.vehicle_id, turnId, "Vehículo entregado");
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
