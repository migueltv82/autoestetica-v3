import { useState } from "react";
import { CheckCircle2, Circle, Gift, MessageCircle, Search, ShieldCheck, Sparkles, TicketCheck } from "lucide-react";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/ui/PageTransition";
import Seo from "../../components/ui/Seo";
import { useSettings } from "../../hooks/useSettings";
import { lookupPublicFidelityCard } from "../../services/publicFidelityApi";
import "./ClientFidelityCardPage.css";

export default function ClientFidelityCardPage() {
  const [phone, setPhone] = useState("");
  const [card, setCard] = useState(null);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { settings } = useSettings();

  const stampsCount = card?.stampsCount || 0;
  const totalStamps = card?.totalStamps || 4;
  const rewardReady = card?.status === "reward_ready" || stampsCount >= totalStamps;

  function changePhone(value) {
    setPhone(value.replace(/\D/g, "").slice(0, 10));
    setError("");
  }

  async function searchCard(event) {
    event.preventDefault();
    if (!/^381\d{7}$/.test(phone)) {
      setError("Ingresá los 10 dígitos comenzando con 381. Ejemplo: 3814000000.");
      return;
    }
    setIsLoading(true);
    setSearched(true);
    setError("");
    try {
      setCard(await lookupPublicFidelityCard(phone));
    } catch {
      setCard(null);
      setError("No pudimos consultar tu tarjeta. Intentá nuevamente en unos instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  const whatsapp = String(settings.whatsapp || "5493815448147").replace(/\D/g, "");
  const message = rewardReady
    ? "¡Hola! Completé mi Tarjeta Fidelity y quiero coordinar el beneficio."
    : `¡Hola! Quiero pedir un turno. Mi Tarjeta Fidelity tiene ${stampsCount} de ${totalStamps} sellos.`;
  const whatsappLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <PublicLayout>
      <Seo title="Clientes | Mi Tarjeta Fidelity" description="Consultá los sellos de tu Tarjeta Fidelity de Autoestética Tucumán." />
      <PageTransition>
        <section className="fidelity-page-shell">
          <div className="container">
            <header className="fidelity-page-header">
              <span className="fidelity-public-badge"><Sparkles size={14} /> Acceso para clientes</span>
              <h1>Tu Tarjeta Fidelity</h1>
              <p>Ingresá tu número de WhatsApp y consultá tus sellos y beneficios disponibles.</p>
            </header>

            <form onSubmit={searchCard} className="fidelity-search-box" noValidate>
              <label htmlFor="client-phone">Número de teléfono</label>
              <div className="fidelity-search-input-group">
                <input id="client-phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="3814000000" value={phone} onChange={(event) => changePhone(event.target.value)} aria-describedby="client-phone-help" aria-invalid={Boolean(error)} />
                <button type="submit" disabled={isLoading}>{isLoading ? <TicketCheck size={17} className="fidelity-pulse" /> : <Search size={17} />} {isLoading ? "Buscando…" : "Ver tarjeta"}</button>
              </div>
              <small id="client-phone-help">Sin 0, sin 15 y sin +54. Ejemplo: 3814000000.</small>
              {error ? <p className="fidelity-search-error" role="alert">{error}</p> : null}
            </form>

            {!isLoading && searched && !card && !error ? (
              <div className="fidelity-not-found-box">
                <TicketCheck size={34} />
                <h2>No encontramos una tarjeta activa</h2>
                <p>Revisá el número ingresado o escribinos para asociar tu tarjeta.</p>
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="fidelity-cta"><MessageCircle size={18} /> Consultar por WhatsApp</a>
              </div>
            ) : null}

            {!isLoading && card ? (
              <article className={`fidelity-digital-card ${rewardReady ? "is-reward-ready" : ""}`}>
                <div className="fidelity-card-header"><div><span className="fidelity-card-brand">{settings.businessName || "Autoestética Tucumán"}</span><h2>Fidelity Pass</h2></div><ShieldCheck size={34} className="fidelity-shield-icon" /></div>
                <div className="fidelity-client-greeting"><small>Titular</small><h3>{card.clientName}</h3></div>
                <div className="fidelity-stamps-row" aria-label={`${stampsCount} de ${totalStamps} sellos completados`}>
                  {Array.from({ length: totalStamps }, (_, index) => {
                    const stamped = index < stampsCount;
                    return <div key={index} className={`fidelity-stamp-bubble ${stamped ? "done" : "pending"}`}>{stamped ? <CheckCircle2 size={27} className="icon-done" /> : <Circle size={27} className="icon-pending" />}<span>Sello {index + 1}</span></div>;
                  })}
                </div>
                {rewardReady ? <div className="fidelity-reward-alert"><Gift size={25} /><div><strong>¡Beneficio desbloqueado!</strong><p>Tu tarjeta está completa. Comunicate para coordinar el canje.</p></div></div> : <div className="fidelity-progress-bar-shell"><div className="fidelity-progress-bar-track"><div className="fidelity-progress-bar-fill" style={{ width: `${Math.min((stampsCount / totalStamps) * 100, 100)}%` }} /></div><span>Tenés <strong>{stampsCount} de {totalStamps} sellos</strong>. Te faltan {Math.max(totalStamps - stampsCount, 0)}.</span></div>}
                <div className="fidelity-card-footer"><a href={whatsappLink} target="_blank" rel="noreferrer" className="fidelity-cta"><MessageCircle size={18} /> {rewardReady ? "Coordinar beneficio" : "Pedir turno"}</a></div>
              </article>
            ) : null}
          </div>
        </section>
      </PageTransition>
    </PublicLayout>
  );
}
