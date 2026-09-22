import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InquiryForm from "./InquiryForm";

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));

vi.mock("../../hooks/useServices", () => ({
  useServices: () => ({ services: [{ name: "Lavado premium" }], isLoading: false }),
}));

vi.mock("../../hooks/useSettings", () => ({
  useSettings: () => ({ settings: { whatsapp: "+54 9 381 5550101" } }),
}));

vi.mock("../../lib/supabase", () => ({
  supabase: { functions: { invoke } },
}));

vi.mock("../../lib/organization", () => ({ ORGANIZATION_SLUG: "negocio-de-prueba" }));

const REQUIRED_FIELDS_ERROR = "Completá los datos requeridos: nombre y apellido, WhatsApp / teléfono, vehículo y al menos un servicio.";
const LEGAL_ERROR = "Aceptá la Política de Privacidad y las Condiciones del Servicio para enviar tu consulta.";

function renderForm() {
  render(<MemoryRouter><InquiryForm /></MemoryRouter>);
  return userEvent.setup();
}

async function completeRequiredFields(user) {
  await user.type(screen.getByLabelText("Nombre y apellido *"), "Ana Pérez");
  await user.type(screen.getByLabelText("WhatsApp / Teléfono *"), "3815550100");
  await user.click(screen.getByRole("button", { name: "Auto", exact: true }));
  await user.click(screen.getByRole("button", { name: "Lavado premium" }));
}

function legalCheckbox() {
  return screen.getByRole("checkbox", { name: /Acepto la Política de Privacidad y las Condiciones del Servicio/i });
}

describe("InquiryForm", () => {
  let whatsappWindow;

  beforeEach(() => {
    invoke.mockReset();
    invoke.mockResolvedValue({ error: null });
    whatsappWindow = { location: { href: "" }, close: vi.fn() };
    vi.spyOn(window, "open").mockReturnValue(whatsappWindow);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("identifica los datos obligatorios faltantes sin culpar al consentimiento", async () => {
    const user = renderForm();
    await user.click(legalCheckbox());

    await user.click(screen.getByRole("button", { name: "Enviar consulta" }));

    expect(screen.getByRole("alert")).toHaveTextContent(REQUIRED_FIELDS_ERROR);
    expect(screen.queryByText(LEGAL_ERROR)).not.toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });

  it("mantiene el consentimiento desmarcado y exige una aceptación explícita", async () => {
    const user = renderForm();
    expect(legalCheckbox()).not.toBeChecked();
    await completeRequiredFields(user);

    await user.click(screen.getByRole("button", { name: "Enviar consulta" }));

    expect(screen.getByRole("alert")).toHaveTextContent(LEGAL_ERROR);
    expect(screen.queryByText(REQUIRED_FIELDS_ERROR)).not.toBeInTheDocument();
    expect(legalCheckbox()).not.toBeChecked();
    expect(invoke).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });

  it("envía la consulta sin token de seguridad al completar los datos y aceptar las condiciones", async () => {
    const user = renderForm();
    await completeRequiredFields(user);
    await user.click(legalCheckbox());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Enviar consulta" }));

    expect(invoke).toHaveBeenCalledExactlyOnceWith("submit-public-inquiry", {
      body: {
        businessSlug: "negocio-de-prueba",
        clientName: "Ana Pérez",
        clientPhone: "3815550100",
        vehicleType: "Auto",
        requestedServices: ["Lavado premium"],
        inquiryNotes: expect.stringContaining("Aceptó Política de Privacidad y Condiciones del Servicio"),
      },
    });
    expect(window.open).toHaveBeenCalledExactlyOnceWith("", "_blank");
    await waitFor(() => expect(whatsappWindow.location.href).toContain("https://wa.me/5493815550101?text="));
    const whatsappText = new URL(whatsappWindow.location.href).searchParams.get("text");
    expect(whatsappText).toContain("Ana Pérez");
    expect(whatsappText).toContain("Lavado premium");
    expect(legalCheckbox()).not.toBeChecked();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("impide enviar si se completa el campo oculto de control", async () => {
    const user = renderForm();
    await completeRequiredFields(user);
    await user.click(legalCheckbox());
    fireEvent.change(document.querySelector('input[name="website"]'), { target: { value: "https://spam.example" } });

    await user.click(screen.getByRole("button", { name: "Enviar consulta" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });

  it("impide enviar si la persona vuelve a desmarcar el consentimiento", async () => {
    const user = renderForm();
    await completeRequiredFields(user);
    await user.click(legalCheckbox());
    await user.click(legalCheckbox());

    await user.click(screen.getByRole("button", { name: "Enviar consulta" }));

    expect(screen.getByRole("alert")).toHaveTextContent(LEGAL_ERROR);
    expect(invoke).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });

  it("conserva los datos después de un error y permite reintentar el envío", async () => {
    const user = renderForm();
    const error = { message: "No pudimos registrar la consulta. Intentá nuevamente." };
    invoke.mockResolvedValueOnce({ error });
    vi.spyOn(console, "error").mockImplementation(() => {});
    await completeRequiredFields(user);
    await user.type(screen.getByLabelText("Detalle adicional"), "Quiero limpiar el interior.");
    await user.click(legalCheckbox());

    await user.click(screen.getByRole("button", { name: "Enviar consulta" }));

    expect(screen.getByRole("alert")).toHaveTextContent(error.message);
    expect(whatsappWindow.close).toHaveBeenCalledOnce();
    expect(whatsappWindow.location.href).toBe("");
    expect(screen.getByLabelText("Nombre y apellido *")).toHaveValue("Ana Pérez");
    expect(screen.getByLabelText("WhatsApp / Teléfono *")).toHaveValue("3815550100");
    expect(screen.getByRole("button", { name: "Auto", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Lavado premium" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Detalle adicional")).toHaveValue("Quiero limpiar el interior.");
    expect(legalCheckbox()).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Enviar consulta" }));

    expect(invoke).toHaveBeenCalledTimes(2);
    expect(invoke.mock.calls[1]).toEqual(invoke.mock.calls[0]);
    await waitFor(() => expect(whatsappWindow.location.href).toContain("https://wa.me/5493815550101?text="));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nombre y apellido *")).toHaveValue("");
    expect(legalCheckbox()).not.toBeChecked();
  });
});
