import { describe, expect, it, vi } from "vitest";
import { buildBusinessSettingsPayload, buildWhatsAppLink, DEFAULT_SETTINGS, mapBusinessSettings } from "./settingsApi";

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("../lib/organization", () => ({
  getPublicOrganizationId: vi.fn(),
}));

describe("settingsApi", () => {
  it("returns default settings when no row exists", () => {
    expect(mapBusinessSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it("maps database columns into public settings", () => {
    expect(mapBusinessSettings({
      business_name: "Autoestética Tucumán",
      address: "Yerba Buena",
      phone: "381",
      whatsapp: "+54 9 381 5448147",
      email: "info@test.com",
      instagram: "@auto",
      opening_hours: "9 a 17",
      logo_url: "logo.webp",
      receipt_footer: null,
      confirmation_message_template: "Confirmación",
      ready_message_template: "Listo",
      club_section_enabled: false,
    })).toMatchObject({
      businessName: "Autoestética Tucumán",
      address: "Yerba Buena",
      whatsapp: "+54 9 381 5448147",
      receiptFooter: DEFAULT_SETTINGS.receiptFooter,
      confirmationMessageTemplate: "Confirmación",
      readyMessageTemplate: "Listo",
      clubSectionEnabled: false,
    });
  });

  it("builds normalized payloads and WhatsApp links", () => {
    const payload = buildBusinessSettingsPayload({
      ...DEFAULT_SETTINGS,
      businessName: "Autoestética Tucumán",
      address: "",
      whatsapp: "+54 9 381 5448147",
      logoUrl: "",
    }, "org-id");

    expect(payload).toMatchObject({
      organization_id: "org-id",
      business_name: "Autoestética Tucumán",
      address: null,
      whatsapp: "+54 9 381 5448147",
      logo_url: null,
      club_section_enabled: true,
    });
    expect(buildWhatsAppLink({ whatsapp: "+54 9 381 5448147" })).toBe("https://wa.me/5493815448147");
  });
});
