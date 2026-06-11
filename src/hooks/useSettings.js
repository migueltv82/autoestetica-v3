import { useState } from "react";

const STORAGE_KEY = "autoestetica_config";

const DEFAULT_SETTINGS = {
  businessName: "Autoestética",
  address: "Av. Alem 1234, Tucumán",
  phone: "381-4400000",
  whatsapp: "+54 9 381 5448147",
  email: "admin@autoestetica.com",
  instagram: "https://instagram.com/autoestetica",
  facebook: "",
  tiktok: "",
  openingHours: "Lunes a Viernes — 09:30 a 16:30"
};

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSettings = (newFields) => {
    setSettings(prev => {
      const next = { ...prev, ...newFields };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Helper to generate WhatsApp link correctly
  const getWaLink = () => {
    const raw = settings.whatsapp.replace(/\D/g, "");
    return `https://wa.me/${raw}`;
  };

  return {
    settings,
    updateSettings,
    getWaLink
  };
}
