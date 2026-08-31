import { useCallback, useEffect, useState } from "react";
import {
  checkClubAdmin,
  deleteClubPlan,
  fetchClubPlans,
  saveClubPlan,
  subscribeToClubPlans,
} from "../services/clubApi";
import { useAuth } from "./useAuth";

export function useClubPlans({ activeOnly = false, realtime = false } = {}) {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextPlans = await fetchClubPlans({ activeOnly });
      setPlans(nextPlans);
      setError("");
    } catch (fetchError) {
      setError(fetchError.message || "No se pudieron cargar los planes del Club.");
    } finally {
      setIsLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    const timer = setTimeout(() => refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    if (!realtime) return undefined;
    return subscribeToClubPlans(() => refresh());
  }, [realtime, refresh]);

  return { plans, isLoading, error, refresh };
}

export function useAdminClubPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isClubAdmin, setIsClubAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setIsClubAdmin(false);
      setPlans([]);
      setIsCheckingAdmin(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const allowed = await checkClubAdmin();
      setIsClubAdmin(allowed);
      setIsCheckingAdmin(false);

      if (!allowed) {
        setPlans([]);
        setError("");
        return;
      }

      const nextPlans = await fetchClubPlans();
      setPlans(nextPlans);
      setError("");
    } catch (fetchError) {
      setError(fetchError.message || "No se pudieron cargar los planes del Club.");
    } finally {
      setIsLoading(false);
      setIsCheckingAdmin(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const timer = setTimeout(() => refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    if (!isClubAdmin) return undefined;
    return subscribeToClubPlans(() => refresh());
  }, [isClubAdmin, refresh]);

  async function upsertPlan(plan) {
    const saved = await saveClubPlan(plan);
    await refresh();
    return saved;
  }

  async function removePlan(id) {
    await deleteClubPlan(id);
    await refresh();
  }

  return {
    plans,
    isCheckingAdmin,
    isClubAdmin,
    isLoading,
    error,
    refresh,
    upsertPlan,
    removePlan,
  };
}
