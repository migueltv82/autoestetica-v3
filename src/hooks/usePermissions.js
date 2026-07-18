import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { getPermissions } from "../utils/permissions";

export function usePermissions() {
  const { profile } = useAuth();
  return useMemo(() => getPermissions(profile), [profile]);
}
