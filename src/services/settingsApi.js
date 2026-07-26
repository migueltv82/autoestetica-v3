import { getPublicOrganizationId } from "../lib/organization";
import { supabase } from "../lib/supabase";
import { dataUrlToBlob, getPortfolioPublicUrl, removePortfolioFiles, uploadPortfolioBlob } from "./storageApi";

const TRANSFORMATION_DEFAULTS = {
  title: "Deslizá y descubrí la diferencia",
  subtitle: "No maquillamos el vehículo: trabajamos cada superficie con un proceso pensado para recuperar su apariencia y proteger el resultado.",
  serviceLabel: "Resultado real de detailing",
};

export const DEFAULT_SETTINGS = {
  businessName: "Autoestética Tucumán",
  address: "Tucumán, Argentina",
  phone: "",
  whatsapp: "+54 9 381 5448147",
  email: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  openingHours: "Lunes a viernes de 9:00 a 18:00",
  logoUrl: "",
  receiptFooter: "Gracias por confiar en nuestro trabajo.",
  confirmationMessageTemplate: "Hola {cliente} 👋 Te escribimos de {negocio} para confirmar tu turno del {fecha} a las {hora}, para tu {vehiculo}. Servicios: {servicios}. ¿Podés confirmarnos tu asistencia?",
  readyMessageTemplate: "Hola {cliente}, queremos informarte que tu {vehiculo} ya está listo para retirar. Por favor, recordá que nuestro horario de atención es {horario}. Ante cualquier inconveniente, comunicate con nosotros.",
  transformationTitle: TRANSFORMATION_DEFAULTS.title,
  transformationSubtitle: TRANSFORMATION_DEFAULTS.subtitle,
  transformationServiceLabel: TRANSFORMATION_DEFAULTS.serviceLabel,
  transformationBeforePath: "",
  transformationAfterPath: "",
  transformationBeforeUrl: "",
  transformationAfterUrl: "",
};

export const SETTINGS_UPDATED_EVENT = "autoestetica:settings-updated";

function isDataUrl(value) {
  return typeof value === "string" && value.startsWith("data:");
}

async function uploadSettingsImage({ organizationId, dataUrl, label }) {
  if (!isDataUrl(dataUrl)) return null;

  const blob = dataUrlToBlob(dataUrl);
  const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "webp";
  const path = `${organizationId}/settings/home-transformation-${label}-${crypto.randomUUID()}.${extension}`;
  await uploadPortfolioBlob({ path, blob, contentType: blob.type, upsert: false });
  return path;
}

export function mapBusinessSettings(data) {
  if (!data) return DEFAULT_SETTINGS;

  const transformationBeforePath = data.transformation_before_path || "";
  const transformationAfterPath = data.transformation_after_path || "";

  return {
    businessName: data.business_name || DEFAULT_SETTINGS.businessName,
    address: data.address || "",
    phone: data.phone || "",
    whatsapp: data.whatsapp || "",
    email: data.email || "",
    instagram: data.instagram || "",
    facebook: data.facebook || "",
    tiktok: data.tiktok || "",
    openingHours: data.opening_hours || "",
    logoUrl: data.logo_url || "",
    receiptFooter: data.receipt_footer || DEFAULT_SETTINGS.receiptFooter,
    confirmationMessageTemplate: data.confirmation_message_template || DEFAULT_SETTINGS.confirmationMessageTemplate,
    readyMessageTemplate: data.ready_message_template || DEFAULT_SETTINGS.readyMessageTemplate,
    transformationTitle: data.transformation_title || DEFAULT_SETTINGS.transformationTitle,
    transformationSubtitle: data.transformation_subtitle || DEFAULT_SETTINGS.transformationSubtitle,
    transformationServiceLabel: data.transformation_service_label || DEFAULT_SETTINGS.transformationServiceLabel,
    transformationBeforePath,
    transformationAfterPath,
    transformationBeforeUrl: transformationBeforePath ? getPortfolioPublicUrl(transformationBeforePath) : "",
    transformationAfterUrl: transformationAfterPath ? getPortfolioPublicUrl(transformationAfterPath) : "",
  };
}

export function buildBusinessSettingsPayload(settings, organizationId) {
  return {
    organization_id: organizationId,
    business_name: settings.businessName,
    address: settings.address || null,
    phone: settings.phone || null,
    whatsapp: settings.whatsapp || null,
    email: settings.email || null,
    instagram: settings.instagram || null,
    facebook: settings.facebook || null,
    tiktok: settings.tiktok || null,
    opening_hours: settings.openingHours || null,
    logo_url: settings.logoUrl || null,
    receipt_footer: settings.receiptFooter || null,
    confirmation_message_template: settings.confirmationMessageTemplate || DEFAULT_SETTINGS.confirmationMessageTemplate,
    ready_message_template: settings.readyMessageTemplate || DEFAULT_SETTINGS.readyMessageTemplate,
    transformation_title: settings.transformationTitle || DEFAULT_SETTINGS.transformationTitle,
    transformation_subtitle: settings.transformationSubtitle || DEFAULT_SETTINGS.transformationSubtitle,
    transformation_service_label: settings.transformationServiceLabel || DEFAULT_SETTINGS.transformationServiceLabel,
    transformation_before_path: settings.transformationBeforePath || null,
    transformation_after_path: settings.transformationAfterPath || null,
  };
}

export async function fetchBusinessSettings({ organizationId }) {
  const targetId = organizationId || await getPublicOrganizationId();
  const { data, error } = await supabase
    .from("business_settings")
    .select("*")
    .eq("organization_id", targetId)
    .single();
  if (error) throw error;
  return mapBusinessSettings(data);
}

export async function saveBusinessSettings({ organizationId, settings, previousSettings = null }) {
  const previousBeforePath = previousSettings?.transformationBeforePath || settings.transformationBeforePath || "";
  const previousAfterPath = previousSettings?.transformationAfterPath || settings.transformationAfterPath || "";
  const uploadedPaths = [];
  let transformationBeforePath = previousBeforePath;
  let transformationAfterPath = previousAfterPath;

  try {
    const nextBeforePath = await uploadSettingsImage({
      organizationId,
      dataUrl: settings.transformationBeforeUrl,
      label: "antes",
    });
    if (nextBeforePath) {
      uploadedPaths.push(nextBeforePath);
      transformationBeforePath = nextBeforePath;
    }

    const nextAfterPath = await uploadSettingsImage({
      organizationId,
      dataUrl: settings.transformationAfterUrl,
      label: "despues",
    });
    if (nextAfterPath) {
      uploadedPaths.push(nextAfterPath);
      transformationAfterPath = nextAfterPath;
    }

    const payload = buildBusinessSettingsPayload({
      ...settings,
      transformationBeforePath,
      transformationAfterPath,
    }, organizationId);

    const { data, error } = await supabase
      .from("business_settings")
      .upsert(payload, { onConflict: "organization_id" })
      .select()
      .single();

    if (error) throw error;

    const obsoletePaths = [
      previousBeforePath && previousBeforePath !== transformationBeforePath ? previousBeforePath : null,
      previousAfterPath && previousAfterPath !== transformationAfterPath ? previousAfterPath : null,
    ].filter(Boolean);
    await removePortfolioFiles(obsoletePaths, { throwOnError: false });

    return mapBusinessSettings(data);
  } catch (error) {
    await removePortfolioFiles(uploadedPaths, { throwOnError: false });
    throw error;
  }
}

export function buildWhatsAppLink(settings) {
  return `https://wa.me/${(settings.whatsapp || "").replace(/\D/g, "")}`;
}
