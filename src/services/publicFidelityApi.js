import { supabase } from "../lib/supabase";

export async function lookupPublicFidelityCard(phone) {
  const normalizedPhone = String(phone || "").replace(/\D/g, "");
  const { data, error } = await supabase.rpc("lookup_fidelity_card_by_phone", { p_phone: normalizedPhone });
  if (error) throw error;
  const card = data?.[0];
  if (!card) return null;
  return {
    clientName: card.client_name,
    stampsCount: Number(card.stamps_count || 0),
    totalStamps: Number(card.total_stamps || 4),
    status: card.status || "active",
  };
}
