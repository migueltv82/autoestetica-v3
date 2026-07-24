import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Circle, Gift, MessageCircle, Search, ShieldCheck, Sparkles, TicketCheck, ArrowLeft, Car, Award, HelpCircle } from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/ui/PageTransition";
import Seo from "../../components/ui/Seo";
import { lookupPublicFidelityCard } from "../../services/publicFidelityApi";
import { useSettings } from "../../hooks/useSettings";
import defaultLogo from "../../assets/logo.webp";
import "./ClientFidelityCardPage.css";

export default function ClientFidelityCardPage() {
  const [searchParams] = useSearchParams();
  const phoneParam = searchParams.get("phone") || searchParams.get("telefono") || "";

  const [phoneInput, setPhoneInput] = useState(phoneParam);
  const [card, setCard] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(phoneParam));
  const [searched, setSearched] = useState(Boolean(phoneParam));
  const [searchError, setSearchError] = useState("");
  const { settings } = useSettings();

  const logoSrc = settings?.logoUrl || defaultLogo;
  const businessName = settings?.businessName || "Autoestética Tucumán";

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!phoneParam) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setSearched(true);
      try {
        const result = await lookupPublicFidelityCard(phoneParam);
        if (isMounted) setCard(result);
      } catch (err) {
        console.error("Error buscando tarjeta fidelity:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, [phoneParam]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const normalizedPhone = phoneInput.replace(/\D/g, "");
    if (!/^381\d{7}$/.test(normalizedPhone)) {
      setSearchError("Ingresá 10 dígitos comenzando con 381. Ejemplo: 3814000000.");
      return;
    }

    setIsLoading(true);
    setSearched(true);
    try {
      setSearchError("");
      const result = await lookupPublicFidelityCard(normalizedPhone);
      setCard(result);
    } catch (err) {
      console.error(err);
      setCard(null);
    } finally {
      setIsLoading(false);
    }
  };

  const whatsappNumber = (settings?.whatsapp || "5493815448147").replace(/\D/g, "");
  const stampsCount = card?.stampsCount || 0;
  const isUnlocked = card?.status === "reward_ready" || stampsCount >= 4;

  const getWhatsAppBookLink = () => {
    const text = isUnlocked
      ? `¡Hola! Ya completé mis 4 troqueles en la Tarjeta Fidelity Pass de ${businessName} 🎁 Quiero agendar mi turno para usar mi 5° LAVADO PREMIUM GRATIS.`
      : `¡Hola ${businessName}! Quiero pedir turno para mi vehículo. Mi Tarjeta Fidelity tiene ${stampsCount} de 4 troqueles cargados.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <PublicLayout>
      <Seo title={`Tarjeta Fidelity Digital · ${businessName}`} description="Consultá tus troqueles y el avance de tu 5° Lavado Gratis en Autoestética Tucumán." />
      <PageTransition>
        <div className="fidelity-page-shell">
          <div className="container">
            <header className="fidelity-page-header">
              <Link to="/" className="fidelity-back-link">
                <ArrowLeft size={16} /> Volver al inicio
              </Link>
              <span className="fidelity-public-badge">
                <Sparkles size={14} /> Club de Fidelización VIP
              </span>
              <h1>Fidelity Pass Digital 🏆</h1>
              <p>Tu tarjeta exclusiva de cliente frecuente en {businessName}. Sumás sellos en cada servicio y el 5° Lavado Premium es 100% GRATIS.</p>
            </header>

            {!phoneParam && (
              <form onSubmit={handleSearch} className="fidelity-search-box">
                <label htmlFor="phone-input"><Search size={15} /> Ingresá tu teléfono para abrir tu tarjeta:</label>
                <div className="fidelity-search-input-group">
                  <input
                    id="phone-input"
                    type="tel"
                    placeholder="Ej: 3814000000"
                    value={phoneInput}
                    onChange={(e) => { setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10)); setSearchError(""); }}
                    required
                  />
                  <button type="submit" disabled={isLoading}>
                    Consultar
                  </button>
                </div>
                <small>Sin 0, sin 15 y sin +54. Ejemplo: 3814000000.</small>
                {searchError ? <p className="fidelity-search-error" role="alert">{searchError}</p> : null}
              </form>
            )}

            {isLoading ? (
              <div className="fidelity-card-loading-box">
                <TicketCheck size={32} className="fidelity-pulse" />
                <span>Cargando tu tarjeta digital VIP...</span>
              </div>
            ) : searched && !card ? (
              <div className="fidelity-not-found-box">
                <TicketCheck size={36} />
                <h3>No encontramos una tarjeta activa para ese número</h3>
                <p>Al confirmar o retirar tu próximo vehículo en el taller, te crearemos automáticamente tu tarjeta digital.</p>
                <a href={getWhatsAppBookLink()} target="_blank" rel="noreferrer" className="fidelity-cta">
                  <MessageCircle size={18} /> Consultar por WhatsApp
                </a>
              </div>
            ) : card ? (
              <div className="fidelity-main-wrapper">
                <article className={`fidelity-digital-card ${isUnlocked ? "is-reward-ready" : ""}`}>
                  <div className="fidelity-card-gloss-shine" />

                  <div className="fidelity-card-header">
                    <div className="fidelity-card-brand-group">
                      <img
                        src={logoSrc}
                        alt={businessName}
                        className="fidelity-card-logo"
                        onError={(e) => { e.currentTarget.src = defaultLogo; }}
                      />
                      <div>
                        <span className="fidelity-card-brand-tag">{businessName}</span>
                        <h2>Fidelity Pass VIP</h2>
                      </div>
                    </div>
                    <div className="fidelity-card-badge-chip">
                      <ShieldCheck size={20} /> <span>CLIENTE VIP</span>
                    </div>
                  </div>

                  {card.client?.name ? (
                    <div className="fidelity-client-greeting">
                      <small>Titular de la tarjeta</small>
                      <h3>{card.client.name}</h3>
                    </div>
                  ) : null}

                  <div className="fidelity-stamps-wrapper">
                    <span className="fidelity-stamps-title">
                      <Award size={15} /> Troqueles de visita acumulados
                    </span>
                    <div className="fidelity-stamps-row" aria-label={`Tarjeta con ${stampsCount} de 4 sellos completados`}>
                      {[0, 1, 2, 3].map((slot) => {
                        const isStamped = slot < stampsCount;
                        return (
                          <div key={slot} className={`fidelity-stamp-bubble ${isStamped ? "done" : "pending"}`}>
                            {isStamped ? (
                              <div className="stamp-seal-badge">
                                <CheckCircle2 size={28} className="icon-done" />
                                <span className="stamp-seal-text">SELLO {slot + 1}</span>
                              </div>
                            ) : (
                              <div className="stamp-seal-badge">
                                <Circle size={26} className="icon-pending" />
                                <span className="stamp-seal-text">{slot + 1}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {isUnlocked ? (
                    <div className="fidelity-reward-alert">
                      <Gift size={28} className="reward-gift-icon" />
                      <div>
                        <strong>🎉 ¡FELICITACIONES! Tenés tu 5° Lavado Gratis listo</strong>
                        <p>Completaste los 4 troqueles. Agendá tu turno respondiendo a este WhatsApp para canjear tu regalo.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="fidelity-progress-bar-shell">
                      <div className="fidelity-progress-bar-track">
                        <div className="fidelity-progress-bar-fill" style={{ width: `${(stampsCount / 4) * 100}%` }} />
                      </div>
                      <div className="fidelity-progress-info">
                        <span>Progreso: <strong>{stampsCount} de 4 sellos</strong></span>
                        <span>Falta {4 - stampsCount} {4 - stampsCount === 1 ? "visita" : "visitas"}</span>
                      </div>
                    </div>
                  )}

                  <div className="fidelity-card-footer">
                    <a href={getWhatsAppBookLink()} target="_blank" rel="noreferrer" className="fidelity-cta">
                      <MessageCircle size={18} /> {isUnlocked ? "🎁 Agendar y Canjear Lavado Gratis" : "Pedir turno por WhatsApp"}
                    </a>
                  </div>
                </article>

                {/* Explicación de uso muy clara */}
                <section className="fidelity-explanation-card">
                  <h3><HelpCircle size={18} /> ¿Cómo funciona tu Tarjeta Fidelity?</h3>
                  <div className="fidelity-steps-grid">
                    <div className="fidelity-step-item">
                      <div className="fidelity-step-num">1</div>
                      <div>
                        <strong>Confirmación de Turno</strong>
                        <p>Cada vez que agendes o retires tu vehículo en el taller, registrante tu visita digital.</p>
                      </div>
                    </div>
                    <div className="fidelity-step-item">
                      <div className="fidelity-step-num">2</div>
                      <div>
                        <strong>Acumulación de Troqueles</strong>
                        <p>Al finalizar cada servicio, se te sumará automáticamente 1 sello a tu tarjeta digital.</p>
                      </div>
                    </div>
                    <div className="fidelity-step-item">
                      <div className="fidelity-step-num">3</div>
                      <div>
                        <strong>5° Lavado Premium GRATIS</strong>
                        <p>Al completar 4 troqueles, tu 5° Lavado Premium es 100% de regalo en {businessName}.</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      </PageTransition>
    </PublicLayout>
  );
}
