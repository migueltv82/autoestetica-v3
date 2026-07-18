import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getPublicOrganizationId } from "../lib/organization";
import { useAuth } from "./useAuth";
import { usePermissions } from "./usePermissions";

const DEFAULT_SETTINGS = {
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
};

const SETTINGS_UPDATED_EVENT = "autoestetica:settings-updated";

function mapSettings(data) {
  if (!data) return DEFAULT_SETTINGS;
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
  };
}

export function useSettings() {
  const { organizationId } = useAuth();
  const { canManageSettings } = usePermissions();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const targetId = organizationId || await getPublicOrganizationId();
      const { data, error: queryError } = await supabase.from("business_settings").select("*").eq("organization_id", targetId).single();
      if (queryError) throw queryError;
      setSettings(mapSettings(data));
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

  useEffect(() => {
    const syncSettings = (event) => setSettings(event.detail);
    window.addEventListener(SETTINGS_UPDATED_EVENT, syncSettings);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, syncSettings);
  }, []);

  async function updateSettings(next) {
    if (!organizationId) throw new Error("Se requiere una sesión administrativa.");
    if (!canManageSettings) throw new Error("No tenes permiso para modificar ajustes.");
    const payload = {
      organization_id: organizationId,
      business_name: next.businessName,
      address: next.address || null,
      phone: next.phone || null,
      whatsapp: next.whatsapp || null,
      email: next.email || null,
      instagram: next.instagram || null,
      facebook: next.facebook || null,
      tiktok: next.tiktok || null,
      opening_hours: next.openingHours || null,
      logo_url: next.logoUrl || null,
      receipt_footer: next.receiptFooter || null,
      confirmation_message_template: next.confirmationMessageTemplate || DEFAULT_SETTINGS.confirmationMessageTemplate,
      ready_message_template: next.readyMessageTemplate || DEFAULT_SETTINGS.readyMessageTemplate,
    };
    const { error: updateError } = await supabase.from("business_settings").upsert(payload, { onConflict: "organization_id" });
    if (updateError) throw updateError;
    setSettings(next);
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: next }));
  }

  const getWaLink = () => `https://wa.me/${(settings.whatsapp || "").replace(/\D/g, "")}`;
  return { settings, isLoading, error, refresh, updateSettings, getWaLink };
}
