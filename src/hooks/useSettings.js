import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { usePermissions } from "./usePermissions";
import {
  buildWhatsAppLink,
  DEFAULT_SETTINGS,
  fetchBusinessSettings,
  saveBusinessSettings,
  SETTINGS_UPDATED_EVENT,
} from "../services/settingsApi";

export function useSettings() {
  const { organizationId } = useAuth();
  const { canManageSettings } = usePermissions();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextSettings = await fetchBusinessSettings({ organizationId });
      setSettings(nextSettings);
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

    const savedSettings = await saveBusinessSettings({ organizationId, settings: next, previousSettings: settings });
    setSettings(savedSettings);
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: savedSettings }));
    return savedSettings;
  }

  const getWaLink = () => buildWhatsAppLink(settings);

  return { settings, isLoading, error, refresh, updateSettings, getWaLink };
}
