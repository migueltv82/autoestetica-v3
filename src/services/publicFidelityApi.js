import { supabase } from "../lib/supabase";

/**
 * Búsqueda pública de tarjeta fidelity por número de teléfono.
 * Usada en la vista pública /clientes?phone=...
 */
export async function lookupPublicFidelityCard(phone) {
  const normalizedPhone = String(phone || "").replace(/\D/g, "");
  const { data, error } = await supabase.rpc("lookup_fidelity_card_by_phone", {
    p_phone: normalizedPhone,
  });
  if (error) throw error;

  const card = data?.[0];
  if (!card) return null;

  const vehicleLabel = (card.vehicle_label || "").trim() || null;

  return {
    client: { name: card.client_name },
    clientName: card.client_name,
    stampsCount: Number(card.stamps_count || 0),
    totalStamps: Number(card.total_stamps || 4),
    status: card.status || "active",
    totalRewardsRedeemed: Number(card.total_rewards_redeemed || 0),
    vehicle: vehicleLabel,
  };
}
