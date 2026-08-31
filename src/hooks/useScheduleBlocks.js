import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { usePermissions } from "./usePermissions";

export function useScheduleBlocks() {
  const { organizationId, user } = useAuth();
  const { canManageScheduleBlocks } = usePermissions();
  const [blocks, setBlocks] = useState([]);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    const { data, error: queryError } = await supabase.from("schedule_blocks").select("*")
      .eq("organization_id", organizationId).gte("ends_at", new Date().toISOString()).order("starts_at");
    if (queryError) setError(queryError.message);
    else { setBlocks(data || []); setError(""); }
  }, [organizationId]);

  useEffect(() => { const timer = setTimeout(refresh, 0); return () => clearTimeout(timer); }, [refresh]);

  async function addBlock({ date, reason }) {
    if (!canManageScheduleBlocks) throw new Error("No tenes permiso para bloquear dias.");
    const startsAt = `${date}T00:00:00-03:00`;
    const endsAt = `${date}T23:59:59-03:00`;
    const { error: insertError } = await supabase.from("schedule_blocks").insert({
      organization_id: organizationId, starts_at: startsAt, ends_at: endsAt,
      reason: reason.trim() || "Día no disponible", created_by: user.id,
    });
    if (insertError) throw insertError;
    await refresh();
  }

  async function deleteBlock(id) {
    if (!canManageScheduleBlocks) throw new Error("No tenes permiso para habilitar dias.");
    const { error: deleteError } = await supabase.from("schedule_blocks").delete()
      .eq("id", id).eq("organization_id", organizationId);
    if (deleteError) throw deleteError;
    setBlocks((current) => current.filter((block) => block.id !== id));
  }

  return { blocks, error, addBlock, deleteBlock };
}
