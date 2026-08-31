import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useRealtimeRefresh(organizationId, tables, refresh) {
  const tableKey = tables.join(",");

  useEffect(() => {
    if (!organizationId || !tables.length) return undefined;
    let timer;
    const scheduleRefresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => refresh({ silent: true }), 120);
    };
    const channel = supabase.channel(`org-${organizationId}-${tableKey}-${crypto.randomUUID()}`);
    tables.forEach((table) => channel.on("postgres_changes", { event: "*", schema: "public", table, filter: `organization_id=eq.${organizationId}` }, scheduleRefresh));
    channel.subscribe();
    return () => { clearTimeout(timer); supabase.removeChannel(channel); };
  }, [organizationId, refresh, tableKey, tables]);
}
