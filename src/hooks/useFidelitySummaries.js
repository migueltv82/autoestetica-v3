import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useFidelitySummaries() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadCards() {
      const { data, error } = await supabase
        .from("fidelity_cards")
        .select("client_id,vehicle_id,stamps_count,total_stamps,status,updated_at")
        .in("status", ["active", "reward_ready"])
        .order("updated_at", { ascending: false });

      if (!active || error) return;
      setCards((data || []).map((card) => ({
        clientId: card.client_id,
        vehicleId: card.vehicle_id,
        stampsCount: Number(card.stamps_count || 0),
        totalStamps: Number(card.total_stamps || 4),
        status: card.status,
      })));
    }

    void loadCards();
    return () => { active = false; };
  }, []);

  return cards;
}
