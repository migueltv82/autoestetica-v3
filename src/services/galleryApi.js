import { getPublicOrganizationId } from "../lib/organization";
import { supabase } from "../lib/supabase";
import { dataUrlToBlob, getPortfolioPublicUrl, removePortfolioFiles, uploadPortfolioBlob } from "./storageApi";

export function mapPortfolioItem(item) {
  return {
    id: item.id,
    title: item.title,
    service: item.service_name,
    beforeUrl: getPortfolioPublicUrl(item.before_path),
    afterUrl: getPortfolioPublicUrl(item.after_path),
    beforePath: item.before_path,
    afterPath: item.after_path,
    date: item.created_at?.slice(0, 10),
    status: item.status,
    publicationConsent: Boolean(item.publication_consent),
  };
}

async function uploadGalleryImage({ organizationId, dataUrl, label }) {
  if (!dataUrl) return null;

  const blob = dataUrlToBlob(dataUrl);
  const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const path = `${organizationId}/${crypto.randomUUID()}-${label}.${extension}`;
  await uploadPortfolioBlob({ path, blob, contentType: blob.type });
  return path;
}

export async function fetchGalleryItems({ organizationId }) {
  const targetId = organizationId || await getPublicOrganizationId();
  const publicOnly = !organizationId;
  let query = supabase
    .from("portfolio_items")
    .select("*")
    .eq("organization_id", targetId)
    .is("deleted_at", null);

  if (publicOnly) query = query.eq("status", "published").eq("publication_consent", true);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapPortfolioItem);
}

export async function createGalleryItem({ organizationId, image }) {
  const uploadedPaths = [];

  try {
    const beforePath = await uploadGalleryImage({ organizationId, dataUrl: image.beforeUrl, label: "antes" });
    if (beforePath) uploadedPaths.push(beforePath);

    const afterPath = await uploadGalleryImage({ organizationId, dataUrl: image.afterUrl, label: "despues" });
    if (afterPath) uploadedPaths.push(afterPath);

    const publicationConsent = Boolean(image.publicationConsent);
    const { error } = await supabase.from("portfolio_items").insert({
      organization_id: organizationId,
      title: image.title.trim(),
      service_name: image.service.trim(),
      before_path: beforePath,
      after_path: afterPath,
      status: image.publishNow && publicationConsent ? "published" : "draft",
      publication_consent: publicationConsent,
    });
    if (error) throw error;
  } catch (error) {
    await removePortfolioFiles(uploadedPaths, { throwOnError: false });
    throw error;
  }
}

export async function softDeleteGalleryItem({ id, organizationId }) {
  const { error } = await supabase
    .from("portfolio_items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", organizationId);
  if (error) throw error;
}

export async function updateGalleryItemStatus({ id, organizationId, status }) {
  const { error } = await supabase
    .from("portfolio_items")
    .update({ status })
    .eq("id", id)
    .eq("organization_id", organizationId);
  if (error) throw error;
}

export { removePortfolioFiles };
