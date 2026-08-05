import { supabase } from "../lib/supabase";

/**
 * Acceso público mediante enlace secreto o teléfono + código de acceso.
 */
export async function lookupPublicFidelityCards({ token = "", phone = "", accessCode = "" } = {}) {
  const { data, error } = await supabase.rpc("lookup_public_fidelity_card", {
    p_token: String(token || "").trim() || null,
    p_phone: String(phone || "").replace(/\D/g, "") || null,
    p_access_code: String(accessCode || "").replace(/[^a-fA-F0-9]/g, "") || null,
  });
  if (error) throw error;

  return (data || []).map((card) => ({
    id: card.card_id,
    publicToken: card.public_token,
    client: { name: card.client_name },
    clientName: card.client_name,
    stampsCount: Number(card.stamps_count || 0),
    totalStamps: Number(card.total_stamps || 4),
    status: card.status || "active",
    totalRewardsRedeemed: Number(card.total_rewards_redeemed || 0),
    vehicle: (card.vehicle_label || "").trim() || null,
  }));
}

export async function lookupPublicFidelityCard(credentials) {
  const cards = await lookupPublicFidelityCards(credentials);
  return cards[0] || null;
}
