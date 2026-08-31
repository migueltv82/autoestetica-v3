import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type TeamMemberPayload = {
  email?: string;
  fullName?: string;
  role?: string;
  temporaryPassword?: string;
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function normalizeRole(role = "employee") {
  return role.trim().toLowerCase();
}

async function findUserByEmail(adminClient: ReturnType<typeof createClient>, email: string) {
  const perPage = 100;
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((candidate) => normalizeEmail(candidate.email) === email);
    if (match || data.users.length < perPage) return match ?? null;
  }
  return null;
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

  if (!authHeader) {
    return jsonResponse(401, { error: "Sesion requerida." });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) {
    return jsonResponse(401, { error: "Sesion invalida." });
  }

  const { data: actorProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("organization_id,role,active")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !actorProfile?.active || actorProfile.role !== "owner") {
    return jsonResponse(403, { error: "No tenes permiso para crear usuarios." });
  }

  let payload: TeamMemberPayload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { error: "JSON invalido." });
  }

  const email = normalizeEmail(payload.email);
  const fullName = payload.fullName?.trim() || "";
  const role = normalizeRole(payload.role);
  const temporaryPassword = payload.temporaryPassword?.trim() || "";

  if (!email || !email.includes("@")) return jsonResponse(400, { error: "Email invalido." });
  if (!["owner", "admin", "employee"].includes(role)) return jsonResponse(400, { error: "Rol invalido." });
  if (temporaryPassword && temporaryPassword.length < 12) {
    return jsonResponse(400, { error: "La clave temporal debe tener al menos 12 caracteres." });
  }

  try {
    let authUser = await findUserByEmail(adminClient, email);
    let invited = false;
    let createdWithPassword = false;
    let passwordUpdated = false;

    if (authUser) {
      const { data: existingProfile, error: existingProfileError } = await adminClient
        .from("profiles")
        .select("organization_id,role,removed_at")
        .eq("id", authUser.id)
        .maybeSingle();

      if (existingProfileError) throw existingProfileError;
      if (existingProfile?.organization_id && existingProfile.organization_id !== actorProfile.organization_id) {
        throw new Error("Ese usuario ya pertenece a otro negocio.");
      }
      if (temporaryPassword) {
        const { error: updatePasswordError } = await adminClient.auth.admin.updateUserById(authUser.id, {
          password: temporaryPassword,
        });
        if (updatePasswordError) throw updatePasswordError;
        passwordUpdated = true;
      }
    }

    if (!authUser) {
      if (temporaryPassword) {
        const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            organization_id: actorProfile.organization_id,
            role,
          },
        });
        if (createError) throw createError;
        authUser = createData.user;
        createdWithPassword = true;
      } else {
        const origin = request.headers.get("Origin") || undefined;
        const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
          data: {
            full_name: fullName,
            organization_id: actorProfile.organization_id,
            role,
          },
          redirectTo: origin ? `${origin}/admin/login` : undefined,
        });

        if (inviteError) throw inviteError;
        authUser = inviteData.user;
        invited = true;
      }
    }

    if (!authUser) throw new Error("No se pudo crear o recuperar el usuario en Supabase Auth.");

    const { error: linkError } = await userClient.rpc("add_existing_user_to_team", {
      member_email: email,
      member_full_name: fullName || null,
      member_role: role,
    });

    if (linkError) throw linkError;

    if (authUser) {
      await adminClient
        .from("profiles")
        .update({ removed_at: null, removed_by: null, removal_reason: null, active: true })
        .eq("id", authUser.id)
        .eq("organization_id", actorProfile.organization_id);
    }

    return jsonResponse(200, {
      id: authUser.id,
      email,
      invited,
      createdWithPassword,
      passwordUpdated,
      message: createdWithPassword
        ? "Usuario creado con clave temporal."
        : passwordUpdated
          ? "Usuario vinculado y clave temporal actualizada."
          : invited
            ? "Usuario creado e invitado por email."
            : "Usuario existente vinculado al equipo.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el usuario.";
    return jsonResponse(400, { error: message });
  }
});
