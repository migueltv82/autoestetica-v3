import { useState } from "react";
import { ExternalLink, MessageCircle, Plus, RefreshCw, TicketCheck } from "lucide-react";
import { useFidelity } from "../../hooks/useFidelity";
import { useFeedback } from "../../hooks/useFeedback";
import { useSettings } from "../../hooks/useSettings";
import { PuzzleFidelityCard } from "../../pages/public/ClientFidelityCardPage";
import defaultLogo from "../../assets/logo.webp";
import { fidelityCardUrl } from "../../utils/whatsapp";
import "../../pages/public/ClientFidelityCardPage.css";
import "./ClientFidelityCard.css";

const vehicleLabel = (card) => [card.vehicle?.brand, card.vehicle?.model].filter(Boolean).join(" ") || card.vehicle?.type || "Vehículo sin identificar";

export default function ClientFidelityCard({ client }) {
  const { cards, isLoading, redeemReward, updateStamps } = useFidelity({ clientId: client?.id, realtime: true });
  const { notify, confirm } = useFeedback();
  const { settings } = useSettings();
  const [processingCardId, setProcessingCardId] = useState(null);

  if (!client) return null;

  async function handleStampChange(card, nextCount) {
    setProcessingCardId(card.id);
    try {
      await updateStamps(card.id, nextCount);
      notify(nextCount >= 4 ? "Tarjeta completada. Se desbloqueó el Lavado Premium Gratis." : `Tarjeta actualizada a ${nextCount} de 4 piezas.`, nextCount >= 4 ? "success" : "info");
    } catch (error) {
      notify(error.message || "Error al agregar troquel.", "error");
    } finally {
      setProcessingCardId(null);
    }
  }

  async function handleRedeem(card) {
    const accepted = await confirm({
      title: "Canjear Lavado Gratis",
      message: `¿Confirmás el canje para ${vehicleLabel(card)} de ${client.name}? Se iniciará una nueva tarjeta para este mismo vehículo.`,
      confirmLabel: "Confirmar canje",
    });
    if (!accepted) return;
    setProcessingCardId(card.id);
    try {
      await redeemReward(card.id);
      notify("Premio canjeado. Se inició una nueva tarjeta para el vehículo.", "success");
    } catch (error) {
      notify(error.message || "Error al canjear premio.", "error");
    } finally {
      setProcessingCardId(null);
    }
  }

  function whatsappLink(card, reward = false) {
    const phone = client.phone.replace(/\D/g, "");
    const vehicle = vehicleLabel(card);
    const cardUrl = fidelityCardUrl(card.publicToken);
    const message = reward
      ? `¡Hola ${client.name}! Tenés disponible un Lavado Premium GRATIS para tu ${vehicle}. Podés pedir tu turno respondiendo este mensaje.`
      : `¡Hola ${client.name}! Te compartimos la Tarjeta Fidelity de tu ${vehicle}. Llevás ${card.stampsCount} de 4 piezas: ${cardUrl}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  return (
    <section className="client-fidelity-section">
      <div className="client-fidelity-header">
        <div><span className="client-fidelity-badge"><TicketCheck size={13} /> Fidelity por vehículo</span><h4>Tarjetas de fidelización</h4></div>
        <span className="client-fidelity-history-chip">{cards.length} {cards.length === 1 ? "tarjeta activa" : "tarjetas activas"}</span>
      </div>

      {isLoading ? <div className="client-fidelity-loading">Cargando tarjetas Fidelity...</div> : null}
      {!isLoading && !cards.length ? <div className="client-fidelity-loading">Todavía no hay tarjetas. Se crea una al confirmar un turno para cada vehículo.</div> : null}

      {!isLoading && cards.length ? <div className="client-fidelity-cards-list">
        {cards.map((card) => {
          const stampsCount = card.stampsCount || 0;
          const rewardReady = card.status === "reward_ready" || stampsCount >= 4;
          const processing = processingCardId === card.id;
          return (
            <article key={card.id} className={`client-fidelity-card-box client-fidelity-card-preview ${rewardReady ? "reward-unlocked" : ""}`}>
              <PuzzleFidelityCard
                card={{
                  ...card,
                  client: { ...card.client, name: client.name },
                  vehicleType: card.vehicle?.type,
                  licensePlate: card.vehicle?.licensePlate,
                  activatedAt: card.createdAt,
                }}
                businessName={settings?.businessName || "Autoestética Tucumán"}
                logoSrc={settings?.logoUrl || defaultLogo}
                stampsCount={stampsCount}
                isUnlocked={rewardReady}
              />
              <div className="client-fidelity-vehicle-caption"><strong>{vehicleLabel(card)}</strong>{card.vehicle?.licensePlate ? <span>{card.vehicle.licensePlate}</span> : null}</div>
              <div className="client-fidelity-actions">
                <div className="fidelity-manual-editor"><button type="button" onClick={() => handleStampChange(card, Math.max(stampsCount - 1, 0))} disabled={processing || stampsCount <= 0} aria-label="Quitar troquel">−</button><strong>{stampsCount}/4</strong><button type="button" onClick={() => handleStampChange(card, Math.min(stampsCount + 1, 4))} disabled={processing || stampsCount >= 4} aria-label="Agregar troquel"><Plus size={14} /></button></div>
                <a href={fidelityCardUrl(card.publicToken)} target="_blank" rel="noreferrer" className="btn-fidelity-view"><ExternalLink size={15} /> Ver como cliente</a>
                {rewardReady ? <><button type="button" onClick={() => handleRedeem(card)} disabled={processing} className="btn-fidelity-redeem"><RefreshCw size={15} /> Canjear premio</button><a href={whatsappLink(card, true)} target="_blank" rel="noreferrer" className="btn-fidelity-whatsapp"><MessageCircle size={15} /> Avisar</a></> : <a href={whatsappLink(card)} target="_blank" rel="noreferrer" className="btn-fidelity-share"><MessageCircle size={15} /> Compartir</a>}
              </div>
            </article>
          );
        })}
      </div> : null}
    </section>
  );
}
