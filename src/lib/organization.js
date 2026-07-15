import { supabase } from "./supabase";

export const ORGANIZATION_SLUG = import.meta.env.VITE_ORGANIZATION_SLUG || "autoestetica-tucuman";

let publicOrganizationId;

export async function getPublicOrganizationId() {
  if (publicOrganizationId) return publicOrganizationId;
  const { data, error } = await supabase.from("organizations").select("id").eq("slug", ORGANIZATION_SLUG).single();
  if (error) throw error;
  publicOrganizationId = data.id;
  return publicOrganizationId;
}
