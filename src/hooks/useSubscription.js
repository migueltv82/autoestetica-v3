import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { usePermissions } from "./usePermissions";

const EMPTY_USAGE = { users: 0, clients: 0, monthlyOrders: 0 };

export function useSubscription() {
  const { organizationId } = useAuth();
  const { canViewPlan } = usePermissions();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(EMPTY_USAGE);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!organizationId || !canViewPlan) {
      setSubscription(null);
      setUsage(EMPTY_USAGE);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const [subscriptionResult, usageResult] = await Promise.all([
      supabase
        .from("organization_subscriptions")
        .select("status,trial_ends_at,current_period_ends_at,cancel_at_period_end,plans(code,name,description,limits,features)")
        .eq("organization_id", organizationId)
        .maybeSingle(),
      supabase.rpc("current_usage"),
    ]);

    if (!subscriptionResult.error) setSubscription(subscriptionResult.data);
    if (!usageResult.error && usageResult.data) setUsage(usageResult.data);
    setIsLoading(false);
  }, [organizationId, canViewPlan]);

  useEffect(() => {
    const timer = setTimeout(refresh, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  return { subscription, usage, isLoading, refresh };
}
