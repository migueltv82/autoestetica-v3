import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InquiryForm from "./InquiryForm";

const { invoke, mockServicesState, mockSettings } = vi.hoisted(() => ({
  invoke: vi.fn(),
  mockServicesState: { services: [{ name: "Lavado premium" }], isLoading: false },
  mockSettings: { whatsapp: "+54 9 381 5550101" },
}));

vi.mock("../../hooks/useServices", () => ({
  useServices: () => mockServicesState,
}));

vi.mock("../../hooks/useSettings", () => ({
  useSettings: () => ({ settings: mockSettings }),
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
  beforeEach(() => {
    invoke.mockReset();
    invoke.mockResolvedValue({ error: null });
    mockServicesState.services = [{ name: "Lavado premium" }];
    mockServicesState.isLoading = false;
    mockSettings.whatsapp = "+54 9 381 5550101";
    vi.spyOn(window, "open").mockReturnValue({ closed: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("valida nombre, teléfono, vehículo, servicio y aceptación legal", async () => {
    const user = renderForm();

    await user.click(screen.getByRole("button", { name: "Enviar consulta" }));

    expect(screen.getByRole("alert")).toHaveTextContent(REQUIRED_FIELDS_ERROR);
    expect(invoke).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();

    await completeRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Enviar consulta" }));

    expect(screen.getByRole("alert")).toHaveTextContent(LEGAL_ERROR);
    expect(legalCheckbox()).not.toBeChecked();
    expect(invoke).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });

  it("no envía si se completa el honeypot", async () => {
    const user = renderForm();
    await completeRequiredFields(user);
    await user.click(legalCheckbox());
    fireEvent.change(document.querySelector('input[name="website"]'), { target: { value: "https://spam.example" } });

    await user.click(screen.getByRole("button", { name: "Enviar consulta" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });

  it("muestra éxito e intenta abrir WhatsApp cuando el submit sale OK", async () => {
    const user = renderForm();
    await completeRequiredFields(user);
    await user.click(legalCheckbox());

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
    await screen.findByText("Tu consulta quedó registrada");
    expect(screen.getByRole("link", { name: "Abrir WhatsApp" })).toHaveAttribute("href", expect.stringContaining("https://wa.me/5493815550101?text="));
    expect(window.open).toHaveBeenCalledExactlyOnceWith(expect.stringContaining("https://wa.me/5493815550101?text="), "_blank", "noopener,noreferrer");
  });

  it("no muestra éxito si invoke devuelve error", async () => {
    const user = renderForm();
    invoke.mockResolvedValueOnce({ error: { name: "FunctionsFetchError", message: "Failed to fetch internal-url" } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    await completeRequiredFields(user);
    await user.click(legalCheckbox());

    await user.click(screen.getByRole("button", { name: "Enviar consulta" }));

    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos conectar con el servicio de consultas. Intentá nuevamente o escribinos por WhatsApp.");
    expect(screen.getByRole("alert")).not.toHaveTextContent("Sin conexión");
    expect(screen.getByRole("alert")).not.toHaveTextContent("internal-url");
    expect(screen.getByRole("alert")).toHaveFocus();
    expect(screen.getByRole("link", { name: "Escribir por WhatsApp (se abre en una nueva pestaña)" })).toHaveAttribute("href", expect.stringContaining("https://wa.me/5493815550101?text="));
    expect(screen.queryByText("Tu consulta quedó registrada")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Abrir WhatsApp" })).not.toBeInTheDocument();
    expect(window.open).not.toHaveBeenCalled();
  });

  it("no envía si no hay servicios publicados", async () => {
    mockServicesState.services = [];
    const user = renderForm();

    expect(screen.getByText(/No hay servicios publicados/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar consulta" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Enviar consulta" }));
    fireEvent.submit(screen.getByText("Consulta rápida").closest("form"));

    expect(screen.queryByText(/al menos un servicio/i)).not.toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });
});
