import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Crown,
  ImageIcon,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TicketCheck,
} from "lucide-react";
import { useClubPlans } from "../../hooks/useClubPlans";
import { useSettings } from "../../hooks/useSettings";
import "./ClubMembershipSection.css";

function formatMoney(value, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function buildFidelityWhatsAppLink(settings) {
  const number = (settings?.whatsapp || "5493815448147").replace(/\D/g, "");
  const text = "Hola, quiero pedir turno para usar la Tarjeta Fidelity del Club Autoestética. ¿Tienen disponibilidad de lunes a viernes de 9 a 17 hs?";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function ClubSkeleton() {
  return (
    <section className="club-public-section" aria-label="Cargando club de usuarios">
      <div className="container">
        <div className="club-public-shell club-public-loading">
          <div className="club-skeleton-line short" />
          <div className="club-skeleton-line" />
          <div className="club-skeleton-grid">
            <div />
            <div />
          </div>
        </div>
      </div>
    </section>
  );
}

function ComingSoonBanner() {
  return (
    <section className="club-public-section club-public-section-compact" aria-label="Próximamente Club Autoestética Tucumán">
      <div className="container">
        <div className="club-coming-soon">
          <span className="club-coming-icon">
            <Crown size={22} />
          </span>
          <div>
            <span className="club-public-badge">
              <Sparkles size={13} /> Lanzamiento próximo
            </span>
            <h2>Próximamente: Club Autoestética Tucumán 🏎️🔥</h2>
            <p>
              Estamos preparando algo exclusivo para los apasionados por el brillo. Atento a nuestras redes sociales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClubErrorBanner() {
  return (
    <section className="club-public-section club-public-section-compact" aria-label="Error al cargar Club Autoestética Tucumán">
      <div className="container">
        <div className="club-error-banner">
          No pudimos cargar la información del Club en este momento. Podés consultar por WhatsApp.
        </div>
      </div>
    </section>
  );
}

function PlanImage({ src, title }) {
  const [isLoaded, setIsLoaded] = useState(false);
  if (!src) return null;

  return (
    <div className="club-plan-image">
      {!isLoaded ? (
        <div className="club-plan-image-placeholder">
          <ImageIcon size={24} />
        </div>
      ) : null}
      <img
        src={src}
        alt={title}
        className={isLoaded ? "is-loaded" : ""}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}

function FidelityCard({ settings }) {
  const whatsappLink = buildFidelityWhatsAppLink(settings);

  return (
    <article className="club-public-card club-fidelity-card">
      <div className="club-card-topline">
        <span className="club-public-badge accent">
          <TicketCheck size={13} /> Tarjeta Fidelity
        </span>
        <small>4 + 1 gratis</small>
      </div>

      <div className="club-fidelity-pass">
        <div className="club-fidelity-pass-header">
          <div>
            <small>Autoestética Tucumán</small>
            <h3>Fidelity Pass</h3>
          </div>
          <ShieldCheck size={28} />
        </div>

        <div className="club-stamps" aria-label="Tres troqueles marcados y uno pendiente">
          {[0, 1, 2, 3].map((slot) => {
            const stamped = slot < 3;
            return (
              <div key={slot} className={`club-stamp ${stamped ? "done" : "pending"}`}>
                {stamped ? (
                  <CheckCircle2 size={21} aria-label="Troquel marcado" />
                ) : (
                  <Circle size={21} aria-label="Troquel pendiente" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="club-fidelity-copy">
        <h3>El 5° Lavado Premium es gratis</h3>
        <p>
          Completá 4 Lavados Premium, sellá tu tarjeta física en cada visita y coordiná el próximo turno por WhatsApp.
        </p>
      </div>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="club-public-cta secondary"
        aria-label="Pedir turno por WhatsApp para Tarjeta Fidelity"
      >
        <MessageCircle size={17} /> Pedir turno por WhatsApp
      </a>
    </article>
  );
}

function PremiumClubCard({ plan }) {
  const hasCheckout = Boolean(plan.checkoutUrl);

  return (
    <article className="club-public-card club-plan-card-public">
      <PlanImage src={plan.imageUrl} title={plan.title} />

      <div className="club-card-topline">
        <span className="club-public-badge">
          <Crown size={13} /> Club premium
        </span>
        <span className="club-limited-chip">Cupos limitados</span>
      </div>

      <div className="club-plan-public-head">
        <div>
          <h2>{plan.title}</h2>
          {plan.subtitle ? <p>{plan.subtitle}</p> : null}
        </div>

        <div className="club-plan-price">
          <small>Membresía mensual</small>
          <strong>{plan.price > 0 ? formatMoney(plan.price, plan.currency) : "Consultar"}</strong>
        </div>
      </div>

      {plan.features.length ? (
        <div className="club-includes">
          <span className="club-includes-title">Qué incluye la suscripción</span>
          <ul className="club-includes-list">
            {plan.features.map((feature) => (
              <li key={feature}>
                <CheckCircle2 size={18} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasCheckout ? (
        <a
          href={plan.checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="club-public-cta"
        >
          Unirme al Club <Crown size={16} />
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="Checkout no configurado"
          aria-label="Checkout no configurado"
          className="club-public-cta disabled"
        >
          Unirme al Club <Crown size={16} />
        </button>
      )}
    </article>
  );
}

export default function ClubMembershipSection() {
  const { plans, isLoading, error } = useClubPlans({ activeOnly: true, realtime: true });
  const { settings } = useSettings();
  const showFidelity = plans.some((plan) => plan.fidelityCardActive);

  if (isLoading) return <ClubSkeleton />;
  if (error) return <ClubErrorBanner />;
  if (!plans.length) return <ComingSoonBanner />;

  return (
    <section className="club-public-section" aria-labelledby="club-membership-title">
      <div className="container">
        <div className="club-public-shell">
          <header className="club-public-header">
            <div>
              <span className="club-public-badge">
                <Sparkles size={13} /> Club de usuarios
              </span>
              <h2 id="club-membership-title">Mantené tu vehículo impecable todo el año</h2>
              <p>
                Una membresía simple para clientes que quieren mantenimiento constante, prioridad de atención y beneficios reales del taller.
              </p>
            </div>
            <span className="club-payment-chip">Activación por Mercado Pago</span>
          </header>

          <div className={`club-public-grid ${showFidelity ? "with-fidelity" : "only-plans"}`}>
            <div className="club-plan-stack">
              {plans.map((plan) => <PremiumClubCard key={plan.id} plan={plan} />)}
            </div>
            {showFidelity ? <FidelityCard settings={settings} /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
