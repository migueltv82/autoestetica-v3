import { supabase } from "../lib/supabase";

export const FIDELITY_REALTIME_TABLES = ["fidelity_cards", "fidelity_stamps"];

export function mapFidelityCard(row) {
  if (!row) return null;

  return {
    id: row.id,
    clientId: row.client_id,
    vehicleId: row.vehicle_id,
    stampsCount: Number(row.stamps_count || 0),
    totalStamps: Number(row.total_stamps || 4),
    status: row.status || "active", // active | reward_ready | redeemed
    rewardDescription: row.reward_description || "5° Lavado Premium Gratis",
    totalRewardsRedeemed: Number(row.total_rewards_redeemed || 0),
    publicToken: row.public_token || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    client: row.clients
      ? {
          id: row.clients.id,
          name: row.clients.name,
          phone: row.clients.phone,
        }
      : null,
    vehicle: row.vehicles
      ? {
          id: row.vehicles.id,
          type: row.vehicles.type,
          brand: row.vehicles.brand,
          model: row.vehicles.model,
          licensePlate: row.vehicles.license_plate,
        }
      : null,
  };
}

/**
 * Obtener la tarjeta Fidelity activa de un cliente.
 */
export async function fetchFidelityCardByClient(clientId) {
  if (!clientId) return null;

  const { data, error } = await supabase
    .from("fidelity_cards")
    .select("*, clients(id, name, phone), vehicles(id, type, brand, model, license_plate)")
    .eq("client_id", clientId)
    .in("status", ["active", "reward_ready"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("Fidelity API warning (table missing or RLS):", error.message);
    return null;
  }

  return data ? mapFidelityCard(data) : null;
}

export async function fetchFidelityCardsByClient(clientId) {
  if (!clientId) return [];
  const { data, error } = await supabase
    .from("fidelity_cards")
    .select("*, clients(id, name, phone), vehicles(id, type, brand, model, license_plate)")
    .eq("client_id", clientId)
    .in("status", ["active", "reward_ready"])
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapFidelityCard);
}

/**
 * Obtener la tarjeta Fidelity activa de un cliente buscando por su teléfono.
 */
export async function fetchFidelityCardByPhone(phoneInput) {
  if (!phoneInput) return null;
  const cleanPhone = phoneInput.replace(/\D/g, "");
  if (!cleanPhone) return null;

  const { data: clientsData, error: clientErr } = await supabase
    .from("clients")
    .select("id")
    .ilike("phone", `%${cleanPhone.slice(-8)}%`)
    .limit(1);

  if (clientErr || !clientsData?.length) return null;
  return fetchFidelityCardByClient(clientsData[0].id);
}

/**
 * Obtener todas las tarjetas Fidelity (para panel admin).
 */
export async function fetchAllFidelityCards() {
  const { data, error } = await supabase
    .from("fidelity_cards")
    .select("*, clients(id, name, phone), vehicles(id, type, brand, model, license_plate)")
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn("Error cargando tarjetas fidelity:", error.message);
    return [];
  }

  return (data || []).map(mapFidelityCard);
}

export async function ensureFidelityCardForClient(clientId, vehicleId = null) {
  const existingCards = await fetchFidelityCardsByClient(clientId);
  const existingCard = existingCards.find((card) => card.vehicleId === vehicleId);
  const { data, error } = await supabase.rpc("ensure_fidelity_card", {
    p_client_id: clientId,
    p_vehicle_id: vehicleId,
  });
  if (error) throw error;
  return { card: mapFidelityCard(data), created: !existingCard };
}

/**
 * Otorgar un troquel automáticamente a un cliente al finalizar su vehículo.
 */
export async function stampFidelityCardForClient(clientId, vehicleId = null, workOrderId = null, notes = "Servicio completado") {
  if (!clientId) return null;
  void vehicleId;

  if (workOrderId) {
    const { data, error } = await supabase.rpc("record_fidelity_stamp", {
      p_order_id: workOrderId,
      p_notes: notes,
    });
    if (error) throw error;
    return {
      card: mapFidelityCard(data?.card),
      newlyUnlocked: Boolean(data?.newlyUnlocked),
      alreadyUnlocked: Boolean(data?.alreadyUnlocked),
    };
  }

  throw new Error("Para asignar un troquel se necesita el turno finalizado.");
}

/**
 * Canjear el premio del 5° lavado gratis y reiniciar una nueva tarjeta en blanco.
 */
export async function redeemFidelityReward(cardId) {
  if (!cardId) return null;
  const { data, error } = await supabase.rpc("redeem_fidelity_reward", { p_card_id: cardId });
  if (error) throw error;
  return mapFidelityCard(data);
}

export async function setFidelityCardStamps(cardId, stampsCount) {
  const { data, error } = await supabase.rpc("set_fidelity_card_stamps", {
    p_card_id: cardId,
    p_stamps: Math.max(0, Math.min(Number(stampsCount) || 0, 4)),
  });
  if (error) throw error;
  return mapFidelityCard(data);
}

/**
 * Suscribirse a cambios en tiempo real en la tabla de tarjetas Fidelity
 */
export function subscribeToFidelityCards(onChange) {
  const channel = supabase
    .channel(`fidelity-cards-${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "fidelity_cards" }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
