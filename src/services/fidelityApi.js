import { supabase } from "../lib/supabase";

export const FIDELITY_REALTIME_TABLES = ["fidelity_cards", "fidelity_stamps"];

export function mapFidelityCard(row) {
  if (!row) return null;

  return {
    id: row.id,
    clientId: row.client_id,
    stampsCount: Number(row.stamps_count || 0),
    totalStamps: Number(row.total_stamps || 4),
    status: row.status || "active", // active | reward_ready | redeemed
    rewardDescription: row.reward_description || "5° Lavado Premium Gratis",
    totalRewardsRedeemed: Number(row.total_rewards_redeemed || 0),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    client: row.clients
      ? {
          id: row.clients.id,
          name: row.clients.name,
          phone: row.clients.phone,
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
    .select("*, clients(id, name, phone)")
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
    .select("*, clients(id, name, phone)")
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn("Error cargando tarjetas fidelity:", error.message);
    return [];
  }

  return (data || []).map(mapFidelityCard);
}

export async function ensureFidelityCardForClient(clientId) {
  const existingCard = await fetchFidelityCardByClient(clientId);
  if (existingCard) return { card: existingCard, created: false };
  const { data, error } = await supabase.from("fidelity_cards").insert({
    client_id: clientId, stamps_count: 0, total_stamps: 4, status: "active",
    reward_description: "5° Lavado Premium Gratis",
  }).select("*, clients(id, name, phone)").single();
  if (error) throw error;
  return { card: mapFidelityCard(data), created: true };
}

/**
 * Otorgar un troquel automáticamente a un cliente al finalizar su vehículo.
 */
export async function stampFidelityCardForClient(clientId, workOrderId = null, notes = "Servicio completado") {
  if (!clientId) return null;

  if (workOrderId) {
    const { data: existingStamp, error: stampLookupError } = await supabase
      .from("fidelity_stamps")
      .select("id")
      .eq("work_order_id", workOrderId)
      .maybeSingle();
    if (stampLookupError) throw stampLookupError;
    if (existingStamp) {
      return { card: await fetchFidelityCardByClient(clientId), newlyUnlocked: false, alreadyUnlocked: true };
    }
  }

  // 1. Buscar tarjeta activa o lista para premio
  let card = await fetchFidelityCardByClient(clientId);

  // 2. Si no existe tarjeta activa, crear una nueva (comenzará en 0 sellos)
  if (!card) {
    const { data: newCardData, error: createError } = await supabase
      .from("fidelity_cards")
      .insert({
        client_id: clientId,
        stamps_count: 0,
        total_stamps: 4,
        status: "active",
        reward_description: "5° Lavado Premium Gratis",
      })
      .select("*, clients(id, name, phone)")
      .single();

    if (createError) throw createError;
    card = mapFidelityCard(newCardData);
  }

  // Si la tarjeta ya estaba en reward_ready (ya completó sus 4 sellos), no agregamos más sellos hasta que la canjee
  if (card.status === "reward_ready") {
    return { card, newlyUnlocked: false, alreadyUnlocked: true };
  }

  const nextStamps = Math.min(4, card.stampsCount + 1);
  const newlyUnlocked = nextStamps === 4;
  const nextStatus = newlyUnlocked ? "reward_ready" : "active";

  // 3. Actualizar la tarjeta
  const { data: updatedCardData, error: updateError } = await supabase
    .from("fidelity_cards")
    .update({
      stamps_count: nextStamps,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", card.id)
    .select("*, clients(id, name, phone)")
    .single();

  if (updateError) throw updateError;

  // 4. Guardar registro del troquel en historial
  try {
    await supabase.from("fidelity_stamps").insert({
      fidelity_card_id: card.id,
      work_order_id: workOrderId,
      notes,
    });
  } catch (err) {
    console.warn("No se pudo registrar troquel en historial:", err);
  }

  const updatedCard = mapFidelityCard(updatedCardData);
  return { card: updatedCard, newlyUnlocked };
}

/**
 * Canjear el premio del 5° lavado gratis y reiniciar una nueva tarjeta en blanco.
 */
export async function redeemFidelityReward(cardId) {
  if (!cardId) return null;

  // 1. Obtener la tarjeta actual
  const { data: card, error: fetchErr } = await supabase
    .from("fidelity_cards")
    .select("*")
    .eq("id", cardId)
    .single();

  if (fetchErr) throw fetchErr;

  // 2. Marcar como canjeada
  const { error: redeemErr } = await supabase
    .from("fidelity_cards")
    .update({
      status: "redeemed",
      total_rewards_redeemed: Number(card.total_rewards_redeemed || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cardId);

  if (redeemErr) throw redeemErr;

  // 3. Crear una nueva tarjeta activa limpia (0 sellos)
  const { data: newCard, error: newCardErr } = await supabase
    .from("fidelity_cards")
    .insert({
      client_id: card.client_id,
      stamps_count: 0,
      total_stamps: 4,
      status: "active",
      reward_description: "5° Lavado Premium Gratis",
      total_rewards_redeemed: Number(card.total_rewards_redeemed || 0) + 1,
    })
    .select("*, clients(id, name, phone)")
    .single();

  if (newCardErr) throw newCardErr;
  return mapFidelityCard(newCard);
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
