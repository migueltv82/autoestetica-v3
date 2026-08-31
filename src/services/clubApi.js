import { supabase } from "../lib/supabase";

export const DEFAULT_CLUB_PLAN = {
  id: null,
  title: "Club Autoestética Premium",
  subtitle: "Una suscripción pensada para mantener tu vehículo impecable con prioridad de atención y beneficios del taller.",
  price: 0,
  currency: "ARS",
  features: [
    "Prioridad para conseguir turnos",
    "Precio preferencial en Lavado Premium",
    "Control periódico del estado exterior e interior",
    "Acceso anticipado a promociones del taller",
  ],
  checkoutUrl: "",
  fidelityCardActive: false,
  isActive: false,
  imageUrl: "",
  createdAt: null,
  updatedAt: null,
  updatedBy: null,
};

export function isHttpsUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function mapClubPlan(row) {
  if (!row) return DEFAULT_CLUB_PLAN;

  return {
    id: row.id,
    title: row.title || DEFAULT_CLUB_PLAN.title,
    subtitle: row.subtitle || "",
    price: Number(row.price || 0),
    currency: row.currency || "ARS",
    features: Array.isArray(row.features) ? row.features : [],
    checkoutUrl: row.checkout_url || "",
    fidelityCardActive: Boolean(row.fidelity_card_active),
    isActive: Boolean(row.is_active),
    imageUrl: row.image_url || "",
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    updatedBy: row.updated_by || null,
  };
}

export function buildClubPlanPayload(plan) {
  const payload = {
    title: plan.title.trim(),
    subtitle: plan.subtitle?.trim() || null,
    price: Math.max(0, Number(plan.price) || 0),
    currency: (plan.currency || "ARS").trim().toUpperCase(),
    features: (plan.features || []).map((feature) => feature.trim()).filter(Boolean),
    checkout_url: plan.checkoutUrl?.trim() || null,
    fidelity_card_active: Boolean(plan.fidelityCardActive),
    is_active: Boolean(plan.isActive),
    image_url: plan.imageUrl?.trim() || null,
  };

  if (plan.id) payload.id = plan.id;
  return payload;
}

export function validateClubPlan(plan) {
  const errors = [];
  const features = (plan.features || []).map((feature) => feature.trim()).filter(Boolean);

  if (!plan.title?.trim()) errors.push("El título del plan es obligatorio.");
  if (Number(plan.price) < 0 || Number.isNaN(Number(plan.price))) errors.push("El precio debe ser un número mayor o igual a 0.");
  if (!features.length) errors.push("Cargá al menos un ítem incluido en el plan.");
  if (plan.checkoutUrl?.trim() && !isHttpsUrl(plan.checkoutUrl.trim())) errors.push("La URL de Mercado Pago debe empezar con https://.");
  if (plan.imageUrl?.trim() && !isHttpsUrl(plan.imageUrl.trim())) errors.push("La URL de imagen debe empezar con https://.");

  return errors;
}

export async function checkClubAdmin() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData?.user?.id;
  if (!userId) return false;

  const { data, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data?.user_id);
}

export async function fetchClubPlans({ activeOnly = false } = {}) {
  let query = supabase
    .from("club_plans")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapClubPlan);
}

export async function saveClubPlan(plan) {
  const errors = validateClubPlan(plan);
  if (errors.length) throw new Error(errors.join(" "));

  const { data, error } = await supabase
    .from("club_plans")
    .upsert(buildClubPlanPayload(plan))
    .select()
    .single();

  if (error) throw error;
  return mapClubPlan(data);
}

export async function deleteClubPlan(id) {
  const { error } = await supabase
    .from("club_plans")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export function subscribeToClubPlans(onChange) {
  const channel = supabase
    .channel(`club-plans-${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "club_plans" }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
