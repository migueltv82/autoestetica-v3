import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { useRealtimeRefresh } from "./useRealtimeRefresh";
import { normalizeStoredArgentinaPhone } from "../utils/whatsapp";

const CLIENT_REALTIME_TABLES = ["clients", "vehicles", "work_orders", "work_order_items", "payments"];

const formatMoney = (value) => new Intl.NumberFormat("es-AR", {
  style: "currency", currency: "ARS", maximumFractionDigits: 0,
}).format(value || 0);

function mapClient(client) {
  const vehicles = (client.vehicles || []).filter((vehicle) => !vehicle.deleted_at);
  const activeOrders = (client.work_orders || []).filter((order) => order.status !== "cancelled");
  const history = activeOrders.map((order) => {
    const itemsTotal = (order.work_order_items || []).reduce((sum, item) => sum + Number(item.total || 0), 0);
    const total = Number(order.total || 0) || itemsTotal;
    const paid = (order.payments || []).filter((payment) => !payment.voided_at).reduce((sum, payment) => sum + (payment.kind === "refund" ? -Number(payment.amount) : Number(payment.amount)), 0);
    return { id: order.id, number: order.number, date: order.scheduled_start ? new Date(order.scheduled_start).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Tucuman" }) : "", status: order.status, services: (order.work_order_items || []).map((item) => item.description).join(", "), total, paid, balance: Math.max(total - paid, 0) };
  });
  const billed = history.reduce((sum, order) => sum + order.total, 0);
  const paid = history.reduce((sum, order) => sum + order.paid, 0);
  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email || "",
    notes: client.notes || "",
    tags: client.tags || [],
    visits: activeOrders.filter((order) => order.status === "delivered").length,
    vehicle: vehicles[0]?.type || "Sin vehículo",
    vehicleId: vehicles[0]?.id || null,
    vehicles,
    billed, paid, balance: Math.max(billed - paid, 0), amount: formatMoney(billed), history,
    createdAt: client.created_at,
  };
}

export function useClients() {
  const { organizationId } = useAuth();
  const [allClients, setAllClients] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async (options = {}) => {
    if (!organizationId) return;
    if (!options.silent) setIsLoading(true);
    const { data, error: queryError } = await supabase
      .from("clients")
      .select("id,name,phone,email,notes,tags,created_at,vehicles(id,type,brand,model,license_plate,color,year,notes,deleted_at),work_orders(id,number,total,status,scheduled_start,work_order_items(description,total),payments(amount,kind,voided_at))")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (queryError) setError(queryError.message);
    else {
      setAllClients((data || []).map(mapClient));
      setError("");
    }
    setIsLoading(false);
  }, [organizationId]);

  useEffect(() => {
    const timer = setTimeout(() => refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);
  useRealtimeRefresh(organizationId, CLIENT_REALTIME_TABLES, refresh);

  async function addClient(newClient) {
    const normalizedPhone = normalizeStoredArgentinaPhone(newClient.phone);
    if (normalizedPhone.length < 8) throw new Error("Ingresá un número de WhatsApp válido.");
    const { data: client, error: clientError } = await supabase.from("clients").insert({
      organization_id: organizationId,
      name: newClient.name.trim(),
      phone: normalizedPhone,
      email: newClient.email || null,
      notes: newClient.notes || null,
    }).select().single();
    if (clientError) throw clientError;
    if (newClient.vehicle) {
      const { error: vehicleError } = await supabase.from("vehicles").insert({
        organization_id: organizationId, client_id: client.id, type: newClient.vehicle,
      });
      if (vehicleError) throw vehicleError;
    }
    await refresh();
    return client;
  }

  async function updateClient(id, updatedData) {
    const normalizedPhone = normalizeStoredArgentinaPhone(updatedData.phone);
    if (normalizedPhone.length < 8) throw new Error("Ingresá un número de WhatsApp válido.");
    const { error: clientError } = await supabase.from("clients").update({
      name: updatedData.name.trim(), phone: normalizedPhone,
      email: updatedData.email?.trim() || null, notes: updatedData.notes?.trim() || null,
    }).eq("id", id).eq("organization_id", organizationId);
    if (clientError) throw clientError;
    const existing = allClients.find((client) => client.id === id);
    if (existing?.vehicleId) {
      const { error: vehicleError } = await supabase.from("vehicles").update({ type: updatedData.vehicle })
        .eq("id", existing.vehicleId).eq("organization_id", organizationId);
      if (vehicleError) throw vehicleError;
    } else if (updatedData.vehicle) {
      const { error: vehicleError } = await supabase.from("vehicles").insert({
        organization_id: organizationId, client_id: id, type: updatedData.vehicle,
      });
      if (vehicleError) throw vehicleError;
    }
    await refresh();
  }

  async function deleteClient(id) {
    const { error: deleteError } = await supabase.from("clients")
      .update({ deleted_at: new Date().toISOString() }).eq("id", id).eq("organization_id", organizationId);
    if (deleteError) throw deleteError;
    await refresh();
  }

  async function addVehicle(clientId, vehicle) {
    const { error: vehicleError } = await supabase.from("vehicles").insert({ organization_id: organizationId, client_id: clientId, type: vehicle.type, brand: vehicle.brand.trim() || null, model: vehicle.model.trim() || null, license_plate: vehicle.licensePlate.trim().toUpperCase() || null, color: vehicle.color.trim() || null, year: vehicle.year ? Number(vehicle.year) : null });
    if (vehicleError) throw vehicleError;
    await refresh();
  }

  async function deleteVehicle(vehicleId) {
    const { error: vehicleError } = await supabase.from("vehicles").update({ deleted_at: new Date().toISOString() }).eq("id", vehicleId).eq("organization_id", organizationId);
    if (vehicleError) throw vehicleError;
    await refresh();
  }

  const clients = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? allClients.filter((client) => client.name.toLowerCase().includes(query) || client.phone.includes(query) || client.email.toLowerCase().includes(query) || client.vehicles.some((vehicle) => [vehicle.brand, vehicle.model, vehicle.license_plate].some((value) => String(value || "").toLowerCase().includes(query)))) : allClients;
  }, [allClients, search]);

  return { clients, totalClients: allClients.length, search, setSearch, isLoading, error, refresh, addClient, updateClient, deleteClient, addVehicle, deleteVehicle };
}
