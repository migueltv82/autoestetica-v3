import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Home from "./Home";

vi.mock("framer-motion", () => ({
  motion: new Proxy({}, {
    get: (_target, tag) => {
      const MotionComponent = ({ children, ...props }) => {
        const {
          animate,
          initial,
          transition,
          viewport,
          whileInView,
          ...elementProps
        } = props;
        void animate;
        void initial;
        void transition;
        void viewport;
        void whileInView;
        const Tag = tag;
        return <Tag {...elementProps}>{children}</Tag>;
      };
      return MotionComponent;
    },
  }),
}));

vi.mock("../../components/layout/PublicLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../../components/ui/PageTransition", () => ({
  default: ({ children }) => <>{children}</>,
}));

vi.mock("../../components/ui/BeforeAfterSlider", () => ({
  default: () => <div data-testid="before-after-slider" />,
}));

vi.mock("../../components/services/ServiceSalesCard", () => ({
  default: ({ service }) => <article>{service.name}</article>,
}));

vi.mock("../../components/public/ClubMembershipSection", () => ({
  default: () => <section data-testid="club-membership-section" />,
}));

vi.mock("../../hooks/useServices", () => ({
  useServices: () => ({
    services: [
      { id: "premium", name: "Lavado premium", featured: true },
      { id: "interior", name: "Limpieza de interior", featured: true },
      { id: "brillo", name: "Abrillantado", featured: false },
    ],
  }),
}));

vi.mock("../../hooks/useSettings", () => ({
  useSettings: () => ({
    settings: {
      businessName: "Autoestética Tucumán",
      whatsapp: "5493815448147",
      logoUrl: "",
    },
  }),
}));

vi.mock("../../hooks/useGallery", () => ({
  useGallery: () => ({
    publishedImages: [],
  }),
}));

describe("Home", () => {
  it("keeps the hero focused on a single WhatsApp CTA", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const whatsappCtas = screen.getAllByRole("link", { name: /consultar por whatsapp/i });
    expect(whatsappCtas).toHaveLength(1);
    expect(whatsappCtas[0]).toHaveAttribute("href", expect.stringContaining("wa.me/5493815448147"));
    expect(screen.queryByRole("link", { name: /ver tratamientos/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /reservar una consulta/i })).not.toBeInTheDocument();
  });
});
