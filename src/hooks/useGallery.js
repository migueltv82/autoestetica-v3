import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getPublicOrganizationId } from "../lib/organization";
import { useAuth } from "./useAuth";

function publicUrl(path) {
  if (!path) return null;
  return supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl;
}
function mapItem(item) {
  return { id: item.id, title: item.title, service: item.service_name, beforeUrl: publicUrl(item.before_path), afterUrl: publicUrl(item.after_path), beforePath: item.before_path, afterPath: item.after_path, date: item.created_at?.slice(0, 10), status: item.status };
}
function dataUrlToBlob(dataUrl) {
  const [header, content] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
  const bytes = Uint8Array.from(atob(content), (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

export function useGallery() {
  const { organizationId } = useAuth();
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const targetId = organizationId || await getPublicOrganizationId();
      let query = supabase.from("portfolio_items").select("*").eq("organization_id", targetId).is("deleted_at", null);
      if (!organizationId) query = query.eq("status", "published").eq("publication_consent", true);
      const { data, error: queryError } = await query.order("created_at", { ascending: false });
      if (queryError) throw queryError;
      setImages((data || []).map(mapItem)); setError("");
    } catch (queryError) { setError(queryError.message); }
    setIsLoading(false);
  }, [organizationId]);

  useEffect(() => { const timer = setTimeout(() => refresh(), 0); return () => clearTimeout(timer); }, [refresh]);

  async function uploadImage(dataUrl, label) {
    if (!dataUrl) return null;
    const blob = dataUrlToBlob(dataUrl);
    const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const path = `${organizationId}/${crypto.randomUUID()}-${label}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("portfolio").upload(path, blob, { contentType: blob.type, upsert: false });
    if (uploadError) throw uploadError;
    return path;
  }

  async function addImage(image) {
    const beforePath = await uploadImage(image.beforeUrl, "antes");
    const afterPath = await uploadImage(image.afterUrl, "despues");
    const { error: insertError } = await supabase.from("portfolio_items").insert({
      organization_id: organizationId, title: image.title.trim(), service_name: image.service.trim(),
      before_path: beforePath, after_path: afterPath, status: "published", publication_consent: true,
    });
    if (insertError) throw insertError;
    await refresh();
  }
  async function deleteImage(id) {
    const item = images.find((image) => image.id === id);
    const paths = [item?.beforePath, item?.afterPath].filter(Boolean);
    const { error: deleteError } = await supabase.from("portfolio_items").update({ deleted_at: new Date().toISOString() })
      .eq("id", id).eq("organization_id", organizationId);
    if (deleteError) throw deleteError;
    if (paths.length) await supabase.storage.from("portfolio").remove(paths);
    await refresh();
  }
  async function toggleStatus(id) {
    const item = images.find((image) => image.id === id);
    const { error: updateError } = await supabase.from("portfolio_items").update({ status: item.status === "published" ? "draft" : "published" })
      .eq("id", id).eq("organization_id", organizationId);
    if (updateError) throw updateError;
    await refresh();
  }

  return { images, publishedImages: images.filter((image) => image.status === "published"), isLoading, error, refresh, addImage, deleteImage, toggleStatus };
}
