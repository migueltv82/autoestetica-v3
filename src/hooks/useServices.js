import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getPublicOrganizationId } from "../lib/organization";
import { useAuth } from "./useAuth";
import { compressImageFile } from "../utils/imageUpload";

const DEFAULT_DISPLAY = { name: true, description: true, gallery: true, duration: true, price: true };
const INITIAL_CATALOG = [
  { name: "Lavado Premium", description: "Lavado exterior detallado, limpieza de llantas, aspirado interior y terminación cuidada para recuperar la presencia del vehículo.", duration_label: "2 a 3 horas", icon_name: "Sparkles", featured: true },
  { name: "Limpieza de Interior", description: "Limpieza profunda de tapizados, alfombras, plásticos y superficies interiores con productos específicos para cada material.", duration_label: "4 a 6 horas", icon_name: "Droplets", featured: true },
  { name: "Abrillantado", description: "Proceso de realce de brillo para mejorar la terminación de la pintura y reducir marcas superficiales.", duration_label: "4 a 6 horas", icon_name: "Sparkles", featured: true },
  { name: "Tratamiento Acrílico / Cerámico", description: "Preparación de la pintura y aplicación de una protección duradera que aporta brillo y facilita el mantenimiento.", duration_label: "1 a 2 días", icon_name: "ShieldCheck", featured: true },
  { name: "Lavado de Bicicletas", description: "Limpieza detallada de cuadro, ruedas y componentes con cuidado especial de transmisión, frenos y terminaciones.", duration_label: "1 a 2 horas", icon_name: "Bike", featured: false },
  { name: "Lavado de Motos", description: "Lavado detallado de carrocería, motor, ruedas y zonas de difícil acceso con terminación segura para cada superficie.", duration_label: "2 a 3 horas", icon_name: "Bike", featured: false },
];
const mapService = (service) => ({
  id: service.id, name: service.name, description: service.description || "", price: Number(service.base_price || 0),
  carPrice: Number(service.display?.carPrice ?? service.car_price ?? service.base_price ?? 0),
  truckPrice: Number(service.display?.truckPrice ?? service.truck_price ?? service.base_price ?? 0),
  priceOnRequest: Boolean(service.display?.priceOnRequest ?? service.price_on_request),
  duration: service.duration_label || (service.estimated_minutes ? `${service.estimated_minutes} min` : "A consultar"),
  durationMinutes: Number(service.estimated_minutes || 120),
  category: service.category || "",
  iconName: service.icon_name || "Zap", coverImageUrl: service.cover_image_url || "",
  featured: Boolean(service.featured), display: { ...DEFAULT_DISPLAY, ...(service.display || {}) },
  gallery: Array.isArray(service.gallery) ? service.gallery : [], active: service.active !== false,
  publicVisible: service.public_visible !== false,
});

export function useServices() {
  const { organizationId } = useAuth();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const targetId = organizationId || await getPublicOrganizationId();
      let query = supabase.from("services").select("*").eq("organization_id", targetId).is("deleted_at", null);
      if (!organizationId) query = query.eq("active", true).eq("public_visible", true);
      let { data, error: queryError } = await query.order("created_at", { ascending: true });
      if (queryError) throw queryError;
      if (organizationId) {
        const existingNames = new Set((data || []).map((service) => service.name.toLowerCase()));
        const missing = INITIAL_CATALOG.filter((service) => !existingNames.has(service.name.toLowerCase()));
        if (missing.length) {
          const { error: seedError } = await supabase.from("services").insert(missing.map((service) => ({
            ...service, organization_id: organizationId, base_price: 0, active: true, public_visible: true,
            display: { ...DEFAULT_DISPLAY, price: false }, gallery: [],
          })));
          if (seedError) throw seedError;
          const refreshed = await supabase.from("services").select("*").eq("organization_id", targetId).is("deleted_at", null).order("created_at", { ascending: true });
          if (refreshed.error) throw refreshed.error;
          data = refreshed.data;
        }
      }
      setServices((data || []).map(mapService)); setError("");
    } catch (queryError) { setError(queryError.message); }
    setIsLoading(false);
  }, [organizationId]);

  useEffect(() => { const timer = setTimeout(() => refresh(), 0); return () => clearTimeout(timer); }, [refresh]);

  const payload = (service) => ({
    organization_id: organizationId, name: service.name.trim(), description: service.description || null,
    category: service.category?.trim() || null,
    base_price: Number(service.carPrice ?? service.price) || 0, duration_label: service.duration || null,
    estimated_minutes: Math.max(15, Number(service.durationMinutes) || 120),
    icon_name: service.iconName || "Zap", cover_image_url: service.coverImageUrl || null,
    featured: Boolean(service.featured), active: service.active !== false, public_visible: service.publicVisible !== false, display: {
      ...DEFAULT_DISPLAY, ...service.display,
      carPrice: Number(service.carPrice) || 0,
      truckPrice: Number(service.truckPrice) || 0,
      priceOnRequest: Boolean(service.priceOnRequest),
    }, gallery: service.gallery || [],
  });

  async function addService(service) {
    const { data, error: insertError } = await supabase.from("services").insert(payload(service)).select().single();
    if (insertError) throw insertError;
    await refresh(); return mapService(data);
  }
  async function updateService(id, fields) {
    const current = services.find((service) => service.id === id);
    const { error: updateError } = await supabase.from("services").update(payload({ ...current, ...fields }))
      .eq("id", id).eq("organization_id", organizationId);
    if (updateError) throw updateError;
    await refresh();
  }
  async function deleteService(id) {
    const service = services.find((item) => item.id === id);
    const mediaPaths = (service?.gallery || []).map((image) => image.storagePath).filter(Boolean);
    const { error: deleteError } = await supabase.from("services").update({ deleted_at: new Date().toISOString(), active: false })
      .eq("id", id).eq("organization_id", organizationId);
    if (deleteError) throw deleteError;
    if (mediaPaths.length) {
      const { error: storageError } = await supabase.storage.from("portfolio").remove(mediaPaths);
      if (storageError) throw storageError;
    }
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
    const storagePath = `${organizationId}/services/${serviceId}/${crypto.randomUUID()}.webp`;
    const { error: uploadError } = await supabase.storage.from("portfolio").upload(storagePath, blob, { contentType: "image/webp", upsert: false });
    if (uploadError) throw uploadError;
    const url = supabase.storage.from("portfolio").getPublicUrl(storagePath).data.publicUrl;
    const image = { url, storagePath, label: service.name };
    const gallery = [...(currentMedia.gallery || service.gallery || []), image];
    try {
      await updateService(serviceId, { gallery, coverImageUrl: currentMedia.coverImageUrl || service.coverImageUrl || url });
    } catch (error) {
      await supabase.storage.from("portfolio").remove([storagePath]);
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
    if (image.storagePath) {
      const { error: storageError } = await supabase.storage.from("portfolio").remove([image.storagePath]);
      if (storageError) throw storageError;
    }
  }

  async function clearServiceImages(serviceId) {
    const service = services.find((item) => item.id === serviceId);
    const paths = (service.gallery || []).map((image) => image.storagePath).filter(Boolean);
    await updateService(serviceId, { gallery: [], coverImageUrl: "" });
    if (paths.length) {
      const { error: storageError } = await supabase.storage.from("portfolio").remove(paths);
      if (storageError) throw storageError;
    }
  }

  return { services, featuredServices: services.filter((service) => service.featured), isLoading, error, refresh, addService, updateService, deleteService, toggleFeatured, togglePublished, updateVisibility, uploadServiceImage, setServiceCover, reorderServiceImages, deleteServiceImage, clearServiceImages };
}
