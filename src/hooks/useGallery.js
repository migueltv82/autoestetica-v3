import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
  createGalleryItem,
  fetchGalleryItems,
  removePortfolioFiles,
  softDeleteGalleryItem,
  updateGalleryItemStatus,
} from "../services/galleryApi";

export function useGallery() {
  const { organizationId } = useAuth();
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextImages = await fetchGalleryItems({ organizationId });
      setImages(nextImages);
      setError("");
    } catch (queryError) {
      setError(queryError.message);
    }
    setIsLoading(false);
  }, [organizationId]);

  useEffect(() => {
    const timer = setTimeout(() => refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  async function addImage(image) {
    await createGalleryItem({ organizationId, image });
    await refresh();
  }

  async function deleteImage(id) {
    const item = images.find((image) => image.id === id);
    await softDeleteGalleryItem({ id, organizationId });
    await removePortfolioFiles([item?.beforePath, item?.afterPath], { throwOnError: false });
    await refresh();
  }

  async function toggleStatus(id) {
    const item = images.find((image) => image.id === id);
    if (item.status !== "published" && !item.publicationConsent) {
      throw new Error("Necesitás confirmar la autorización del cliente antes de publicar.");
    }

    await updateGalleryItemStatus({
      id,
      organizationId,
      status: item.status === "published" ? "draft" : "published",
    });
    await refresh();
  }

  return {
    images,
    publishedImages: images.filter((image) => image.status === "published"),
    isLoading,
    error,
    refresh,
    addImage,
    deleteImage,
    toggleStatus,
  };
}
