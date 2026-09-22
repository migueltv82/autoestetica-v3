// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, rpc } = vi.hoisted(() => ({ createClient: vi.fn(), rpc: vi.fn() }));

vi.mock("https://esm.sh/@supabase/supabase-js@2.101.1", () => ({ createClient }));

const SITE_ORIGIN = "https://autoestetica.example";
const INQUIRY = {
  businessSlug: "negocio-de-prueba",
  clientName: "Ana Pérez",
  clientPhone: "3815550100",
  vehicleType: "Auto",
  requestedServices: ["Lavado premium"],
  inquiryNotes: "Consulta desde la web.",
};

describe("submit-public-inquiry", () => {
  let handleRequest;
  let env;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    env = {
      SUPABASE_URL: "https://proyecto-de-prueba.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "clave-solo-para-pruebas",
      PUBLIC_SITE_ORIGINS: SITE_ORIGIN,
    };
    vi.stubGlobal("Deno", {
      env: { get: (key) => env[key] },
      serve: (handler) => { handleRequest = handler; },
    });
    vi.stubGlobal("fetch", vi.fn());
    createClient.mockReturnValue({ rpc });
    rpc.mockResolvedValue({ data: "consulta-de-prueba", error: null });
    await import("./index.ts");
  });

  afterEach(() => vi.unstubAllGlobals());

  function request({ origin = SITE_ORIGIN, method = "POST", body = JSON.stringify(INQUIRY) } = {}) {
    return new Request("https://proyecto-de-prueba.supabase.co/functions/v1/submit-public-inquiry", {
      method,
      headers: { Origin: origin, "Content-Type": "application/json" },
      ...(method === "POST" ? { body } : {}),
    });
  }

  it("registra una consulta sin token ni configuración de captcha", async () => {
    const result = await handleRequest(request());

    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ id: "consulta-de-prueba" });
    expect(result.headers.get("Access-Control-Allow-Origin")).toBe(SITE_ORIGIN);
    expect(rpc).toHaveBeenCalledExactlyOnceWith("submit_inquiry", {
      business_slug: INQUIRY.businessSlug,
      client_name: INQUIRY.clientName,
      client_phone: INQUIRY.clientPhone,
      vehicle_type: INQUIRY.vehicleType,
      requested_services: INQUIRY.requestedServices,
      inquiry_notes: INQUIRY.inquiryNotes,
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rechaza orígenes no autorizados antes de acceder a la base", async () => {
    const result = await handleRequest(request({ origin: "https://otro-sitio.example" }));

    expect(result.status).toBe(403);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("responde al preflight de un origen permitido", async () => {
    const result = await handleRequest(request({ method: "OPTIONS" }));

    expect(result.status).toBe(200);
    expect(result.headers.get("Access-Control-Allow-Methods")).toBe("POST, OPTIONS");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rechaza métodos distintos de POST", async () => {
    const result = await handleRequest(request({ method: "GET" }));

    expect(result.status).toBe(405);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rechaza JSON inválido sin registrar la consulta", async () => {
    const result = await handleRequest(request({ body: "{" }));

    expect(result.status).toBe(400);
    expect(await result.json()).toEqual({ error: "Solicitud inválida" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("sigue exigiendo la configuración del servicio de consultas", async () => {
    delete env.SUPABASE_SERVICE_ROLE_KEY;

    const result = await handleRequest(request());

    expect(result.status).toBe(503);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("conserva los rechazos del límite de frecuencia del servidor", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "Alcanzaste el límite de consultas por hora" } });

    const result = await handleRequest(request());

    expect(result.status).toBe(400);
    expect(await result.json()).toEqual({ error: "Alcanzaste el límite de consultas por hora" });
  });
});
