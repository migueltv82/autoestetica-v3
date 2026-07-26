import { CalendarDays, Car, Clock3, MessageCircle, Pencil, Phone, ReceiptText, Trash2, UserRound } from "lucide-react";
import Modal from "../ui/Modal";
import { readyTurnWhatsAppLink, turnConfirmationWhatsAppLink } from "../../utils/whatsapp";
import { getTurnVehicleLabel } from "../../utils/turnPresentation";
import "./TurnDetailsModal.css";

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export default function TurnDetailsModal({ turn, settings, onClose, onEdit, onReceipt, onDelete, canUseOperationalActions = true }) {
  if (!turn) return null;
  const vehicle = getTurnVehicleLabel(turn) || "Sin vehículo informado";
  const vehicleBrandModel = [turn.vehicleBrand, turn.vehicleModel].filter(Boolean).join(" ")
    || "Marca y modelo sin informar";
  const whatsappUrl = turn.status === "Listo"
    ? readyTurnWhatsAppLink(turn, settings?.readyMessageTemplate, settings?.openingHours)
    : turnConfirmationWhatsAppLink(turn, settings?.businessName, settings?.confirmationMessageTemplate);

  return <Modal isOpen onClose={onClose} title={<span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: ".38rem" }}><b style={{ font: "inherit" }}>Detalle del turno</b><small style={{ display: "inline-flex", padding: ".28rem .58rem", border: "1px solid rgba(96, 165, 250, .3)", borderRadius: "7px", background: "rgba(96, 165, 250, .1)", color: "#bfdbfe", fontSize: ".86rem", fontWeight: 800, lineHeight: 1.15, letterSpacing: ".025em", textShadow: "0 0 14px rgba(96, 165, 250, .32)" }}>{vehicleBrandModel}</small></span>} maxWidth="780px">
    <div className="turn-detail-hero"><span>{turn.status}</span><strong>{turn.service}</strong></div>
    <div className="turn-detail-grid">
      <div><UserRound size={18} /><span>Cliente<strong>{turn.client || "Sin nombre"}</strong></span></div>
      <div><Phone size={18} /><span>Teléfono<strong>{turn.phone || "Sin teléfono"}</strong></span></div>
      <div><Car size={18} /><span>Vehículo<strong>{vehicle}</strong></span></div>
      <div><CalendarDays size={18} /><span>Fecha<strong>{turn.date}{turn.endDate && turn.endDate !== turn.date ? ` → ${turn.endDate}` : ""}</strong></span></div>
      <div><Clock3 size={18} /><span>Horario<strong>{turn.time} – {turn.endTime}</strong></span></div>
      <div><ReceiptText size={18} /><span>Importe<strong>{Number(turn.amount || 0) > 0 ? money.format(turn.amount) : "Sin importe"}</strong></span></div>
    </div>
    {turn.notes ? <div className="turn-detail-notes"><span>Observaciones</span><p>{turn.notes}</p></div> : null}
    <div className="turn-detail-actions">
      {canUseOperationalActions && turn.phone && !["Cancelado", "Finalizado"].includes(turn.status) ? <a href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp</a> : null}
      {onEdit ? <button type="button" onClick={() => { onClose(); onEdit(turn); }}><Pencil size={17} /> Editar</button> : null}
      {onReceipt ? <button type="button" onClick={() => { onClose(); onReceipt(turn); }}><ReceiptText size={17} /> Recibo</button> : null}
      {onDelete ? <button type="button" className="danger" onClick={() => { onClose(); onDelete(turn.id); }}><Trash2 size={17} /> Eliminar</button> : null}
    </div>
  </Modal>;
}
