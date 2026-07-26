import { getPublicOrganizationId } from "../lib/organization";
import { supabase } from "../lib/supabase";
import { getPortfolioPublicUrl, removePortfolioFiles, uploadPortfolioBlob } from "./storageApi";

export const DEFAULT_SERVICE_DISPLAY = { name: true, description: true, gallery: true, duration: true, price: true };

const INITIAL_SERVICE_CATALOG = [
  { name: "Lavado Premium", description: "Lavado exterior detallado, limpieza de llantas, aspirado interior y terminación cuidada para recuperar la presencia del vehículo.", duration_label: "2 a 3 horas", icon_name: "Sparkles", featured: true },
  { name: "Limpieza de Interior", description: "Limpieza profunda de tapizados, alfombras, plásticos y superficies interiores con productos específicos para cada material.", duration_label: "4 a 6 horas", icon_name: "Droplets", featured: true },
  { name: "Abrillantado", description: "Proceso de realce de brillo para mejorar la terminación de la pintura y reducir marcas superficiales.", duration_label: "4 a 6 horas", icon_name: "Sparkles", featured: true },
  { name: "Tratamiento Acrílico / Cerámico", description: "Preparación de la pintura y aplicación de una protección duradera que aporta brillo y facilita el mantenimiento.", duration_label: "1 a 2 días", icon_name: "ShieldCheck", featured: true },
  { name: "Lavado de Bicicletas", description: "Limpieza detallada de cuadro, ruedas y componentes con cuidado especial de transmisión, frenos y terminaciones.", duration_label: "1 a 2 horas", icon_name: "Bike", featured: false },
  { name: "Lavado de Motos", description: "Lavado detallado de carrocería, motor, ruedas y zonas de difícil acceso con terminación segura para cada superficie.", duration_label: "2 a 3 horas", icon_name: "Bike", featured: false },
];

export function mapService(service) {
  return {
    id: service.id,
    name: service.name,
    description: service.description || "",
    price: Number(service.base_price || 0),
    carPrice: Number(service.display?.carPrice ?? service.car_price ?? service.base_price ?? 0),
    truckPrice: Number(service.display?.truckPrice ?? service.truck_price ?? service.base_price ?? 0),
    priceOnRequest: Boolean(service.display?.priceOnRequest ?? service.price_on_request),
    duration: service.duration_label || (service.estimated_minutes ? `${service.estimated_minutes} min` : "A consultar"),
    durationMinutes: Number(service.estimated_minutes || 120),
    category: service.category || "",
    iconName: service.icon_name || "Zap",
    coverImageUrl: service.cover_image_url || "",
    featured: Boolean(service.featured),
    display: { ...DEFAULT_SERVICE_DISPLAY, ...(service.display || {}) },
    gallery: Array.isArray(service.gallery) ? service.gallery : [],
    active: service.active !== false,
    publicVisible: service.public_visible !== false,
  };
}

export function buildServicePayload(service, organizationId) {
  return {
    organization_id: organizationId,
    name: service.name.trim(),
    description: service.description || null,
    category: service.category?.trim() || null,
    base_price: Number(service.carPrice ?? service.price) || 0,
    duration_label: service.duration || null,
    estimated_minutes: Math.max(15, Number(service.durationMinutes) || 120),
    icon_name: service.iconName || "Zap",
    cover_image_url: service.coverImageUrl || null,
    featured: Boolean(service.featured),
    active: service.active !== false,
    public_visible: service.publicVisible !== false,
    display: {
      ...DEFAULT_SERVICE_DISPLAY,
      ...service.display,
      carPrice: Number(service.carPrice) || 0,
      truckPrice: Number(service.truckPrice) || 0,
      priceOnRequest: Boolean(service.priceOnRequest),
    },
    gallery: service.gallery || [],
  };
}

async function listServiceRows({ targetId, publicOnly }) {
  let query = supabase
    .from("services")
    .select("*")
    .eq("organization_id", targetId)
    .is("deleted_at", null);

  if (publicOnly) query = query.eq("active", true).eq("public_visible", true);

  const { data, error } = await query.order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

async function seedMissingInitialServices(organizationId, rows) {
  const existingNames = new Set(rows.map((service) => service.name.toLowerCase()));
  const missing = INITIAL_SERVICE_CATALOG.filter((service) => !existingNames.has(service.name.toLowerCase()));
  if (!missing.length) return rows;

  const { error } = await supabase.from("services").insert(missing.map((service) => ({
    ...service,
    organization_id: organizationId,
    base_price: 0,
    active: true,
    public_visible: true,
    display: { ...DEFAULT_SERVICE_DISPLAY, price: false },
    gallery: [],
  })));
  if (error) throw error;

  return listServiceRows({ targetId: organizationId, publicOnly: false });
}

export async function fetchServices({ organizationId, canManageCatalog }) {
  const targetId = organizationId || await getPublicOrganizationId();
  const publicOnly = !organizationId;
  let rows = await listServiceRows({ targetId, publicOnly });

  if (organizationId && canManageCatalog) {
    rows = await seedMissingInitialServices(organizationId, rows);
  }

  return rows.map(mapService);
}

export async function createService({ organizationId, service }) {
  const { data, error } = await supabase
    .from("services")
    .insert(buildServicePayload(service, organizationId))
    .select()
    .single();
  if (error) throw error;
  return mapService(data);
}

export async function saveService({ id, organizationId, service }) {
  const { error } = await supabase
    .from("services")
    .update(buildServicePayload(service, organizationId))
    .eq("id", id)
    .eq("organization_id", organizationId);
  if (error) throw error;
}

export async function softDeleteService({ id, organizationId }) {
  const { error } = await supabase
    .from("services")
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq("id", id)
    .eq("organization_id", organizationId);
  if (error) throw error;
}

export async function uploadServiceImageBlob({ organizationId, serviceId, blob }) {
  const storagePath = `${organizationId}/services/${serviceId}/${crypto.randomUUID()}.webp`;
  await uploadPortfolioBlob({ path: storagePath, blob, contentType: "image/webp" });
  return {
    url: getPortfolioPublicUrl(storagePath),
    storagePath,
  };
}

export { removePortfolioFiles };
