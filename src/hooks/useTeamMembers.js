import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { usePermissions } from "./usePermissions";

function mapMember(member) {
  return {
    id: member.id,
    email: member.email || "Sin email",
    fullName: member.full_name || "",
    role: member.role,
    active: member.active,
    createdAt: member.created_at,
    lastSignInAt: member.last_sign_in_at,
  };
}

export function useTeamMembers() {
  const { organizationId } = useAuth();
  const { canManageSettings } = usePermissions();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!organizationId || !canManageSettings) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error: queryError } = await supabase.rpc("list_team_members");
    if (queryError) {
      setError(queryError.message);
    } else {
      setMembers((data || []).map(mapMember));
      setError("");
    }
    setIsLoading(false);
  }, [organizationId, canManageSettings]);

  useEffect(() => {
    const timer = setTimeout(refresh, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  async function readFunctionError(invokeError, functionName) {
    if (invokeError?.name === "FunctionsFetchError" || invokeError?.message === "Failed to send a request to the Edge Function") {
      return `No se pudo contactar la Edge Function ${functionName}. Verificá que esté desplegada en el mismo proyecto de VITE_SUPABASE_URL y que se haya publicado con --no-verify-jwt.`;
    }
    if (!invokeError?.context) return invokeError?.message || `No se pudo ejecutar ${functionName}.`;
    try {
      const payload = await invokeError.context.json();
      return payload?.error || invokeError.message;
    } catch {
      return invokeError.message;
    }
  }

  async function addMember(member) {
    if (!canManageSettings) throw new Error("No tenes permiso para agregar usuarios.");
    const { data, error: addError } = await supabase.functions.invoke("create-team-member", {
      body: {
        email: member.email,
        fullName: member.fullName || "",
        role: member.role,
        temporaryPassword: member.temporaryPassword || "",
      },
    });
    if (addError) throw new Error(await readFunctionError(addError, "create-team-member"));
    await refresh();
    return data;
  }

  async function updateMember(member) {
    if (!canManageSettings) throw new Error("No tenes permiso para modificar usuarios.");
    const { error: updateError } = await supabase.rpc("update_team_member", {
      member_id: member.id,
      member_full_name: member.fullName || null,
      member_role: member.role,
      member_active: member.active,
    });
    if (updateError) throw updateError;
    await refresh();
  }

  async function deleteMember(memberId) {
    if (!canManageSettings) throw new Error("No tenes permiso para eliminar usuarios.");
    const { data, error: deleteError } = await supabase.functions.invoke("delete-team-member", {
      body: { memberId },
    });
    if (deleteError) throw new Error(await readFunctionError(deleteError, "delete-team-member"));
    await refresh();
    return data;
  }

  return { members, isLoading, error, refresh, addMember, updateMember, deleteMember };
}
