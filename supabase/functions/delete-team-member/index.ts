import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type DeletePayload = {
  memberId?: string;
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function countReferences(adminClient: ReturnType<typeof createClient>, memberId: string) {
  const queries = [
    adminClient.from("work_orders").select("id", { count: "exact", head: true }).eq("created_by", memberId),
    adminClient.from("payments").select("id", { count: "exact", head: true }).eq("created_by", memberId),
    adminClient.from("cash_movements").select("id", { count: "exact", head: true }).eq("created_by", memberId),
    adminClient.from("receipts").select("id", { count: "exact", head: true }).eq("created_by", memberId),
    adminClient.from("cash_closures").select("id", { count: "exact", head: true }).eq("closed_by", memberId),
    adminClient.from("schedule_blocks").select("id", { count: "exact", head: true }).eq("created_by", memberId),
  ];

  const results = await Promise.all(queries);
  const blockingError = results.find((result) => result.error);
  if (blockingError?.error) throw blockingError.error;
  return results.reduce((sum, result) => sum + Number(result.count || 0), 0);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse(405, { error: "Metodo no permitido" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = request.headers.get("Authorization");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(500, { error: "Faltan variables de entorno de Supabase en la funcion." });
  }

  if (!authHeader) return jsonResponse(401, { error: "Sesion requerida." });

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) return jsonResponse(401, { error: "Sesion invalida." });

  let payload: DeletePayload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { error: "JSON invalido." });
  }

  const memberId = payload.memberId?.trim();
  if (!memberId) return jsonResponse(400, { error: "Usuario invalido." });
  if (memberId === authData.user.id) return jsonResponse(403, { error: "No podes eliminar tu propio usuario." });

  try {
    const { data: actorProfile, error: actorError } = await adminClient
      .from("profiles")
      .select("organization_id,role,active,removed_at")
      .eq("id", authData.user.id)
      .single();

    if (actorError || !actorProfile?.active || actorProfile.removed_at || actorProfile.role !== "owner") {
      return jsonResponse(403, { error: "No tenes permiso para eliminar usuarios." });
    }

    const { data: targetProfile, error: targetError } = await adminClient
      .from("profiles")
      .select("id,organization_id,role,active,removed_at")
      .eq("id", memberId)
      .single();

    if (targetError || !targetProfile || targetProfile.organization_id !== actorProfile.organization_id || targetProfile.removed_at) {
      return jsonResponse(404, { error: "Usuario inexistente." });
    }

    if (targetProfile.role === "owner") {
      const { count, error: ownerCountError } = await adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", actorProfile.organization_id)
        .eq("role", "owner")
        .eq("active", true)
        .is("removed_at", null);

      if (ownerCountError) throw ownerCountError;
      if (Number(count || 0) <= 1) {
        return jsonResponse(400, { error: "El negocio debe conservar al menos un owner activo." });
      }
    }

    const references = await countReferences(adminClient, memberId);

    if (references === 0) {
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(memberId);
      if (!deleteAuthError) {
        return jsonResponse(200, {
          deleted: true,
          mode: "auth_deleted",
          message: "Usuario eliminado de Supabase Auth y del equipo.",
        });
      }
    }

    const { error: softDeleteError } = await adminClient
      .from("profiles")
      .update({
        active: false,
        removed_at: new Date().toISOString(),
        removed_by: authData.user.id,
        removal_reason: references > 0 ? `Conservado por ${references} referencia(s) historica(s).` : "Eliminacion logica por seguridad.",
      })
      .eq("id", memberId)
      .eq("organization_id", actorProfile.organization_id);

    if (softDeleteError) throw softDeleteError;

    return jsonResponse(200, {
      deleted: true,
      mode: "soft_deleted",
      message: "Usuario eliminado del equipo. Se conserva internamente para no romper historial.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar el usuario.";
    return jsonResponse(400, { error: message });
  }
});
