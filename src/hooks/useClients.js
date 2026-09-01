import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { useRealtimeRefresh } from "./useRealtimeRefresh";
import { normalizeStoredArgentinaPhone } from "../utils/whatsapp";
import { usePermissions } from "./usePermissions";

const CLIENT_REALTIME_TABLES = ["clients", "vehicles", "work_orders", "work_order_items"];
const FINANCE_CLIENT_REALTIME_TABLES = ["payments"];

function clientWriteError(error, phone, currentClientId = null, clients = []) {
  const constraint = String(error?.message || "");
  const isDuplicatePhone = constraint.includes("clients_organization_id_phone_key")
    || constraint.includes("clients_org_active_phone_unique");
  if (error?.code !== "23505" || !isDuplicatePhone) return error;
  const duplicate = clients.find((client) => client.id !== currentClientId && client.phone === phone);
  const detail = duplicate?.name ? ` Ya pertenece a ${duplicate.name}.` : "";
  return new Error(`Ya existe un cliente activo con ese numero de WhatsApp.${detail}`);
}

const formatMoney = (value) => new Intl.NumberFormat("es-AR", {
  style: "currency", currency: "ARS", maximumFractionDigits: 0,
}).format(value || 0);

function mapClient(client, canManageFinance) {
  const vehicles = (client.vehicles || []).filter((vehicle) => !vehicle.deleted_at);
  const allOrders = client.work_orders || [];
  const history = allOrders.map((order) => {
    const itemsTotal = canManageFinance ? (order.work_order_items || []).reduce((sum, item) => sum + Number(item.total || 0), 0) : 0;
    const total = canManageFinance ? Number(order.total || 0) || itemsTotal : 0;
    const paid = canManageFinance ? (order.payments || []).filter((payment) => !payment.voided_at).reduce((sum, payment) => sum + (payment.kind === "refund" ? -Number(payment.amount) : Number(payment.amount)), 0) : 0;
    return { id: order.id, number: order.number, date: order.scheduled_start ? new Date(order.scheduled_start).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Tucuman" }) : "", status: order.status, services: (order.work_order_items || []).map((item) => item.description).join(", "), total, paid, balance: Math.max(total - paid, 0) };
  });
  const billableHistory = history.filter((order) => !["cancelled", "no_show"].includes(order.status));
  const billed = billableHistory.reduce((sum, order) => sum + order.total, 0);
  const paid = billableHistory.reduce((sum, order) => sum + order.paid, 0);
  const fidelityCard = vehicles.flatMap((vehicle) => vehicle.fidelity_cards || [])
    .find((card) => ["active", "reward_ready"].includes(card.status));
  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email || "",
    notes: client.notes || "",
    tags: client.tags || [],
    visits: allOrders.filter((order) => order.status === "delivered").length,
    vehicle: vehicles[0]?.type || "Sin vehículo",
    vehicleId: vehicles[0]?.id || null,
    vehicles,
    fidelityPublicToken: fidelityCard?.public_token || null,
    billed, paid, balance: Math.max(billed - paid, 0), amount: formatMoney(billed), history,
    createdAt: client.created_at,
  };
}

const PAGE_SIZE = 50;

export function useClients() {
  const { organizationId } = useAuth();
  const { canManageFinance, canManageClients } = usePermissions();
  const [clients, setClients] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ totalClients: 0, frequentClients: 0, newThisMonth: 0 });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchClientRows = useCallback(async (ids) => {
    if (!ids.length) return [];
    const orderSelect = canManageFinance
      ? "work_orders(id,number,total,status,scheduled_start,work_order_items(description,total),payments(amount,kind,voided_at))"
      : "work_orders(id,number,status,scheduled_start,work_order_items(description))";
    const { data, error: rowsError } = await supabase
      .from("clients")
      .select(`id,name,phone,email,notes,tags,created_at,vehicles(id,type,brand,model,license_plate,color,year,notes,deleted_at,fidelity_cards(public_token,status)),${orderSelect}`)
      .in("id", ids);
    if (rowsError) throw rowsError;
    const byId = new Map((data || []).map((client) => [client.id, mapClient(client, canManageFinance)]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  }, [canManageFinance]);

  const refresh = useCallback(async (options = {}) => {
    if (!organizationId) return;
    if (!options.silent) setIsLoading(true);

    const [matchResult, statsResult] = await Promise.all([
      supabase.rpc("search_clients", { p_query: debouncedSearch || null, p_limit: PAGE_SIZE, p_offset: 0 }),
      supabase.rpc("client_directory_stats").maybeSingle(),
    ]);
    if (matchResult.error) { setError(matchResult.error.message); setIsLoading(false); return; }

    const matches = matchResult.data || [];
    setTotalCount(matches[0]?.total_count ?? 0);
    if (statsResult.data) {
      setStats({
        totalClients: Number(statsResult.data.total_clients || 0),
        frequentClients: Number(statsResult.data.frequent_clients || 0),
        newThisMonth: Number(statsResult.data.new_this_month || 0),
      });
    }

    try {
      setClients(await fetchClientRows(matches.map((row) => row.id)));
      setError("");
    } catch (rowsError) {
      setError(rowsError.message);
    }
    setIsLoading(false);
  }, [organizationId, debouncedSearch, fetchClientRows]);

  useEffect(() => {
    const timer = setTimeout(() => refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);
  const realtimeTables = useMemo(
    () => (canManageFinance ? [...CLIENT_REALTIME_TABLES, ...FINANCE_CLIENT_REALTIME_TABLES] : CLIENT_REALTIME_TABLES),
    [canManageFinance],
  );
  useRealtimeRefresh(organizationId, realtimeTables, refresh);

  async function loadMore() {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const { data: matches, error: matchError } = await supabase.rpc("search_clients", {
        p_query: debouncedSearch || null, p_limit: PAGE_SIZE, p_offset: clients.length,
      });
      if (matchError) throw matchError;
      const nextRows = await fetchClientRows((matches || []).map((row) => row.id));
      setClients((current) => [...current, ...nextRows]);
    } catch (loadMoreError) {
      setError(loadMoreError.message);
    } finally {
      setIsLoadingMore(false);
    }
  }
  const hasMore = clients.length < totalCount;

  async function addClient(newClient) {
    if (!canManageClients) throw new Error("No tenes permiso para crear clientes.");
    const normalizedPhone = normalizeStoredArgentinaPhone(newClient.phone);
    if (normalizedPhone.length < 8) throw new Error("Ingresá un número de WhatsApp válido.");
    const { data: client, error: clientError } = await supabase.from("clients").insert({
      organization_id: organizationId,
      name: newClient.name.trim(),
      phone: normalizedPhone,
      email: newClient.email || null,
      notes: newClient.notes || null,
    }).select().single();
    if (clientError) throw clientWriteError(clientError, normalizedPhone, null, clients);
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
    if (!canManageClients) throw new Error("No tenes permiso para modificar clientes.");
    const normalizedPhone = normalizeStoredArgentinaPhone(updatedData.phone);
    if (normalizedPhone.length < 8) throw new Error("Ingresá un número de WhatsApp válido.");
    const { error: clientError } = await supabase.from("clients").update({
      name: updatedData.name.trim(), phone: normalizedPhone,
      email: updatedData.email?.trim() || null, notes: updatedData.notes?.trim() || null,
    }).eq("id", id).eq("organization_id", organizationId);
    if (clientError) throw clientWriteError(clientError, normalizedPhone, id, clients);
    const existing = clients.find((client) => client.id === id);
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
    if (!canManageClients) throw new Error("No tenes permiso para eliminar clientes.");
    const { error: deleteError } = await supabase.rpc("delete_client_completely", { p_client_id: id });
    if (deleteError) throw deleteError;
    await refresh();
  }

  async function addVehicle(clientId, vehicle) {
    if (!canManageClients) throw new Error("No tenes permiso para agregar vehiculos.");
    const { error: vehicleError } = await supabase.from("vehicles").insert({ organization_id: organizationId, client_id: clientId, type: vehicle.type, brand: vehicle.brand.trim() || null, model: vehicle.model.trim() || null, license_plate: vehicle.licensePlate.trim().toUpperCase() || null, color: vehicle.color.trim() || null, year: vehicle.year ? Number(vehicle.year) : null });
    if (vehicleError) throw vehicleError;
    await refresh();
  }

  async function deleteVehicle(vehicleId) {
    if (!canManageClients) throw new Error("No tenes permiso para eliminar vehiculos.");
    const { error: vehicleError } = await supabase.from("vehicles").update({ deleted_at: new Date().toISOString() }).eq("id", vehicleId).eq("organization_id", organizationId);
    if (vehicleError) throw vehicleError;
    await refresh();
  }

  return {
    clients,
    totalCount,
    totalClients: stats.totalClients,
    frequentClients: stats.frequentClients,
    newThisMonth: stats.newThisMonth,
    search,
    setSearch,
    hasMore,
    loadMore,
    isLoadingMore,
    isLoading,
    error,
    refresh,
    addClient,
    updateClient,
    deleteClient,
    addVehicle,
    deleteVehicle,
  };
}
