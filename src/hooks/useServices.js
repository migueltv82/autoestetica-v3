import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { compressImageFile } from "../utils/imageUpload";
import { usePermissions } from "./usePermissions";
import {
  createService,
  fetchServices,
  removePortfolioFiles,
  saveService,
  softDeleteService,
  uploadServiceImageBlob,
} from "../services/servicesApi";

export function useServices() {
  const { organizationId } = useAuth();
  const { canManageCatalog } = usePermissions();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextServices = await fetchServices({ organizationId, canManageCatalog });
      setServices(nextServices);
      setError("");
    } catch (queryError) {
      setError(queryError.message);
    }
    setIsLoading(false);
  }, [organizationId, canManageCatalog]);

  useEffect(() => {
    const timer = setTimeout(() => refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  async function addService(service) {
    const created = await createService({ organizationId, service });
    await refresh();
    return created;
  }

  async function updateService(id, fields) {
    const current = services.find((service) => service.id === id);
    await saveService({ id, organizationId, service: { ...current, ...fields } });
    await refresh();
  }

  async function deleteService(id) {
    const service = services.find((item) => item.id === id);
    const mediaPaths = (service?.gallery || []).map((image) => image.storagePath).filter(Boolean);
    await softDeleteService({ id, organizationId });
    await removePortfolioFiles(mediaPaths);
    await refresh();
  }

  const toggleFeatured = (id) => updateService(id, { featured: !services.find((service) => service.id === id)?.featured });

  const togglePublished = (id) => {
    const service = services.find((item) => item.id === id);
    const next = !(service.active && service.publicVisible);
    return updateService(id, { active: next, publicVisible: next });
  };

  const updateVisibility = (id, key, value) => {
    const service = services.find((item) => item.id === id);
    return updateService(id, { display: { ...service.display, [key]: value } });
  };

  async function uploadServiceImage(serviceId, file, currentMedia = {}) {
    const service = services.find((item) => item.id === serviceId);
    if (!service) throw new Error("Servicio no encontrado.");

    const blob = await compressImageFile(file);
    const image = {
      ...await uploadServiceImageBlob({ organizationId, serviceId, blob }),
      label: service.name,
    };
    const gallery = [...(currentMedia.gallery || service.gallery || []), image];

    try {
      await updateService(serviceId, {
        gallery,
        coverImageUrl: currentMedia.coverImageUrl || service.coverImageUrl || image.url,
      });
    } catch (error) {
      await removePortfolioFiles([image.storagePath], { throwOnError: false });
      throw error;
    }

    return image;
  }

  async function setServiceCover(serviceId, image) {
    await updateService(serviceId, { coverImageUrl: image.url });
  }

  async function reorderServiceImages(serviceId, gallery) {
    await updateService(serviceId, { gallery });
  }

  async function deleteServiceImage(serviceId, image) {
    const service = services.find((item) => item.id === serviceId);
    const gallery = (service.gallery || []).filter((item) => item.url !== image.url);
    const coverImageUrl = service.coverImageUrl === image.url ? gallery[0]?.url || "" : service.coverImageUrl;
    await updateService(serviceId, { gallery, coverImageUrl });
    await removePortfolioFiles([image.storagePath]);
  }

  async function clearServiceImages(serviceId) {
    const service = services.find((item) => item.id === serviceId);
    const paths = (service.gallery || []).map((image) => image.storagePath).filter(Boolean);
    await updateService(serviceId, { gallery: [], coverImageUrl: "" });
    await removePortfolioFiles(paths);
  }

  return {
    services,
    featuredServices: services.filter((service) => service.featured),
    isLoading,
    error,
    refresh,
    addService,
    updateService,
    deleteService,
    toggleFeatured,
    togglePublished,
    updateVisibility,
    uploadServiceImage,
    setServiceCover,
    reorderServiceImages,
    deleteServiceImage,
    clearServiceImages,
  };
}
