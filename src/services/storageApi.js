import { supabase } from "../lib/supabase";

const PORTFOLIO_BUCKET = "portfolio";

export function getPortfolioPublicUrl(path) {
  if (!path) return null;
  return supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadPortfolioBlob({ path, blob, contentType, upsert = false }) {
  const { error } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .upload(path, blob, { contentType, upsert });
  if (error) throw error;
}

export async function removePortfolioFiles(paths, { throwOnError = true } = {}) {
  const cleanPaths = (paths || []).filter(Boolean);
  if (!cleanPaths.length) return { error: null };

  const { error } = await supabase.storage.from(PORTFOLIO_BUCKET).remove(cleanPaths);
  if (error && throwOnError) throw error;
  return { error };
}

export function dataUrlToBlob(dataUrl) {
  const [header, content] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/webp";
  const bytes = Uint8Array.from(atob(content), (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}
