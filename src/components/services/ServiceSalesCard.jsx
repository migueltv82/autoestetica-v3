import { ArrowRight, Clock3, MessageCircle, ShieldCheck, Star } from "lucide-react";
import { getServiceCoverUrl } from "../../utils/serviceMedia";
import { isTwoWheelService } from "../../utils/servicePricing";
import "./ServiceSalesCard.css";
import { Link } from "react-router-dom";
import { serviceSlug } from "../../utils/serviceSlug";

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

function Price({ service }) {
  if (service.priceOnRequest || (!Number(service.carPrice) && !Number(service.truckPrice))) return <div className="sales-card-prices consult"><small>Evaluación previa</small><strong>Consultar precio</strong></div>;
  if (isTwoWheelService(service)) return <div className="sales-card-prices"><small>Precio del servicio</small><strong>{money.format(service.carPrice || 0)}</strong></div>;
  return <div className="sales-card-prices two"><span><small>Auto</small><strong>{money.format(service.carPrice || 0)}</strong></span><span><small>Camioneta</small><strong>{money.format(service.truckPrice || 0)}</strong></span></div>;
}

export default function ServiceSalesCard({ service, whatsappNumber, compact = false }) {
  const message = `Hola, quiero consultar por el servicio ${service.name}. ¿Podrían brindarme más información?`;
  const whatsapp = `https://wa.me/${String(whatsappNumber || "5493815448147").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  return <article className={`service-sales-card ${compact ? "compact" : ""}`}>
    <div className="sales-card-media"><img src={getServiceCoverUrl(service)} alt={service.name} loading="lazy" decoding="async" /><div className="sales-card-badges">{service.featured ? <span className="featured"><Star size={13} /> Más elegido</span> : <span><ShieldCheck size={13} /> Detailing</span>}<span><Clock3 size={13} /> {service.duration}</span></div></div>
    <div className="sales-card-body"><span className="sales-card-category">{service.category || "Tratamiento profesional"}</span><h3>{service.name}</h3><p>{service.description}</p><Price service={service} /><div className="sales-card-actions"><a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Consultar servicio</a>{!compact ? <Link className="sales-card-detail" to={`/servicios/${serviceSlug(service.name)}`}>Ver detalle <ArrowRight size={14} /></Link> : null}</div></div>
  </article>;
}
