import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClubMembershipSection from "./ClubMembershipSection";

const clubState = vi.hoisted(() => ({
  value: {
    plans: [],
    isLoading: false,
    error: "",
  },
}));

vi.mock("../../hooks/useClubPlans", () => ({
  useClubPlans: () => clubState.value,
}));

vi.mock("../../hooks/useSettings", () => ({
  useSettings: () => ({
    settings: {
      whatsapp: "+54 9 381 5448147",
    },
  }),
}));

describe("ClubMembershipSection", () => {
  beforeEach(() => {
    clubState.value = {
      plans: [],
      isLoading: false,
      error: "",
    };
  });

  it("renders a skeleton while loading", () => {
    clubState.value = { ...clubState.value, isLoading: true };

    render(<ClubMembershipSection />);

    expect(screen.getByLabelText(/cargando club de usuarios/i)).toBeInTheDocument();
  });

  it("renders the coming-soon banner when there are no active plans", () => {
    render(<ClubMembershipSection />);

    expect(screen.getByText(/próximamente: club autoestética tucumán/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /unirme al club/i })).not.toBeInTheDocument();
  });

  it("renders active premium plan data and fidelity card", () => {
    clubState.value.plans = [{
      id: "plan-id",
      title: "Club Autoestética Premium",
      subtitle: "Beneficios exclusivos",
      price: 25000,
      currency: "ARS",
      features: ["Prioridad para turnos", "Precio preferencial"],
      checkoutUrl: "https://mp.test/club",
      fidelityCardActive: true,
      imageUrl: "",
    }];

    render(<ClubMembershipSection />);

    expect(screen.getByRole("heading", { name: "Club Autoestética Premium" })).toBeInTheDocument();
    expect(screen.getByText("$ 25.000")).toBeInTheDocument();
    expect(screen.getByText("Prioridad para turnos")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /unirme al club/i })).toHaveAttribute("href", "https://mp.test/club");
    expect(screen.getByText(/5° lavado premium es gratis/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pedir turno por whatsapp/i })).toHaveAttribute("href", expect.stringContaining("wa.me/5493815448147"));
  });

  it("disables the checkout CTA when Mercado Pago is not configured", () => {
    clubState.value.plans = [{
      id: "plan-id",
      title: "Club Autoestética Premium",
      subtitle: "Beneficios exclusivos",
      price: 25000,
      currency: "ARS",
      features: ["Prioridad para turnos"],
      checkoutUrl: "",
      fidelityCardActive: false,
      imageUrl: "",
    }];

    render(<ClubMembershipSection />);

    expect(screen.getByRole("button", { name: /checkout no configurado/i })).toBeDisabled();
  });
});
