import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

function allowedOrigin(request: Request) {
  const origin = request.headers.get("Origin") || "";
  const configured = (Deno.env.get("PUBLIC_SITE_ORIGINS") || "")
    .split(",").map((value) => value.trim()).filter(Boolean);
  return configured.includes(origin) ? origin : "";
}

function response(status: number, body: Record<string, unknown>, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    },
  });
}

Deno.serve(async (request) => {
  const origin = allowedOrigin(request);
  if (!origin) return response(403, { error: "Origen no permitido" }, "null");
  if (request.method === "OPTIONS") return response(200, { ok: true }, origin);
  if (request.method !== "POST") return response(405, { error: "Método no permitido" }, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return response(503, { error: "El servicio de consultas no está disponible" }, origin);
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return response(400, { error: "Solicitud inválida" }, origin); }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await admin.rpc("submit_inquiry", {
    business_slug: String(body.businessSlug || "").slice(0, 100),
    client_name: String(body.clientName || "").slice(0, 100),
    client_phone: String(body.clientPhone || "").slice(0, 30),
    vehicle_type: String(body.vehicleType || "").slice(0, 30),
    requested_services: Array.isArray(body.requestedServices)
      ? body.requestedServices.slice(0, 8).map((value) => String(value).slice(0, 120)) : [],
    inquiry_notes: String(body.inquiryNotes || "").slice(0, 1000),
  });
  if (error) return response(400, { error: error.message }, origin);
  return response(200, { id: data }, origin);
});
