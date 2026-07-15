import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

const formatMoney = (value) => new Intl.NumberFormat("es-AR", {
  style: "currency", currency: "ARS", maximumFractionDigits: 0,
}).format(value || 0);

function mapClient(client) {
  const activeOrders = (client.work_orders || []).filter((order) => order.status !== "cancelled");
  return {
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email || "",
    notes: client.notes || "",
    tags: client.tags || [],
    visits: activeOrders.filter((order) => order.status === "delivered").length,
    vehicle: client.vehicles?.[0]?.type || "Sin vehículo",
    vehicleId: client.vehicles?.[0]?.id || null,
    vehicles: client.vehicles || [],
    amount: formatMoney(activeOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)),
    createdAt: client.created_at,
  };
}

export function useClients() {
  const { organizationId } = useAuth();
  const [allClients, setAllClients] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setIsLoading(true);
    const { data, error: queryError } = await supabase
      .from("clients")
      .select("id,name,phone,email,notes,tags,created_at,vehicles(id,type,brand,model,license_plate,color),work_orders(id,total,status)")
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

  async function addClient(newClient) {
    const { data: client, error: clientError } = await supabase.from("clients").insert({
      organization_id: organizationId,
      name: newClient.name.trim(),
      phone: newClient.phone.replace(/\s/g, ""),
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
    const { error: clientError } = await supabase.from("clients").update({
      name: updatedData.name.trim(), phone: updatedData.phone.replace(/\s/g, ""),
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

  const clients = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? allClients.filter((client) => client.name.toLowerCase().includes(query) || client.phone.includes(query)) : allClients;
  }, [allClients, search]);

  return { clients, totalClients: allClients.length, search, setSearch, isLoading, error, refresh, addClient, updateClient, deleteClient };
}
