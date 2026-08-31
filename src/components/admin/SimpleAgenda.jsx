import { CalendarDays, Car, ChevronLeft, ChevronRight, Clock3, MessageCircle, Pencil, ReceiptText, Search, Trash2, UserRound, X } from "lucide-react";
import { readyTurnWhatsAppLink, turnConfirmationWhatsAppLink } from "../../utils/whatsapp";
import { getTodayString, turnOccupiesDate } from "../../utils/date";
import { getServiceTone } from "../../utils/serviceTone";
import { getTurnStatusClass, getTurnVehicleLabel } from "../../utils/turnPresentation";
import "./SimpleAgenda.css";
import "./ServiceTone.css";

const STATUSES = ["Pendiente", "Confirmado", "En proceso", "Listo", "Finalizado", "Cancelado"];
const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
function moveDate(value, days) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-CA");
}

function dateLabel(value) {
  const today = getTodayString();
  if (value === today) return "Hoy";
  if (value === moveDate(today, 1)) return "Mañana";
  if (value === moveDate(today, -1)) return "Ayer";
  return new Date(`${value}T12:00:00`).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

export default function SimpleAgenda({ turns, selectedDate, onDateChange, search, onSearchChange, statusFilter, onStatusFilterChange, onStatusChange, onEditTurn, onDeleteTurn, onGenerateReceipt, onViewTurn, settings, canUseOperationalActions = true }) {
  const visibleTurns = turns
    .filter((turn) => turnOccupiesDate(turn, selectedDate))
    .filter((turn) => !search.trim() || [turn.client, turn.service, turn.vehicle, turn.vehicleBrand, turn.vehicleModel, turn.phone].some((value) => String(value || "").toLowerCase().includes(search.trim().toLowerCase())))
    .filter((turn) => !statusFilter || turn.status === statusFilter)
    .sort((a, b) => a.time.localeCompare(b.time));
  const activeCount = visibleTurns.filter((turn) => !["Finalizado", "Cancelado"].includes(turn.status)).length;
  const total = visibleTurns.reduce((sum, turn) => sum + Number(turn.amount || 0), 0);

  return <div className="simple-agenda">
    <section className="agenda-day-nav dashboard-panel">
      <button type="button" onClick={() => onDateChange(moveDate(selectedDate, -1))} aria-label="Día anterior"><ChevronLeft size={21} /></button>
      <label><span>{dateLabel(selectedDate)}</span><input type="date" value={selectedDate} onChange={(event) => onDateChange(event.target.value)} /></label>
      <button type="button" onClick={() => onDateChange(moveDate(selectedDate, 1))} aria-label="Día siguiente"><ChevronRight size={21} /></button>
    </section>

    {selectedDate !== getTodayString() ? <button className="agenda-today-button" type="button" onClick={() => onDateChange(getTodayString())}>Volver a hoy</button> : null}

    <div className="agenda-quick-summary">
      <span><strong>{visibleTurns.length}</strong> turnos</span><span><strong>{activeCount}</strong> activos</span><span><strong>{money.format(total)}</strong> total</span>
    </div>

    <section className="agenda-compact-filters">
      <label><Search size={17} /><input type="search" placeholder="Buscar cliente o servicio" value={search} onChange={(event) => onSearchChange(event.target.value)} />{search ? <button type="button" onClick={() => onSearchChange("")} aria-label="Limpiar búsqueda"><X size={15} /></button> : null}</label>
      <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)} aria-label="Filtrar por estado"><option value="">Todos</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
    </section>

    <section className="agenda-card-list">
      {visibleTurns.map((turn) => <article className={`agenda-mobile-turn is-overlapping ${getServiceTone(turn)} status-${getTurnStatusClass(turn.status)}`} key={turn.id} role="button" tabIndex={0} onClick={(event) => { if (!event.target.closest("a,button,select")) onViewTurn?.(turn); }} onKeyDown={(event) => { if (!event.target.closest("a,button,select") && (event.key === "Enter" || event.key === " ")) onViewTurn?.(turn); }}>
        <header><div className="agenda-turn-time"><Clock3 size={17} /><strong>{turn.date === selectedDate ? turn.time : "En curso"}</strong><span>{turn.date !== turn.endDate ? `hasta ${turn.endDate} · ${turn.endTime}` : `– ${turn.endTime}`}</span></div>{onStatusChange ? <select value={turn.status} onChange={(event) => onStatusChange(turn.id, event.target.value)} aria-label={`Estado de ${turn.client}`}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select> : <span className="agenda-readonly-status">{turn.status}</span>}</header>
        <div className="agenda-turn-client"><span><UserRound size={18} /></span><div><h3>{turn.client}</h3><p><Car size={14} /> {getTurnVehicleLabel(turn)}</p></div></div>
        <p className="agenda-turn-service">{turn.service}</p>
        <p className="agenda-compact-vehicle"><Car size={13} />{getTurnVehicleLabel(turn) || "Vehículo sin informar"}</p>
        {turn.amount > 0 ? <strong className="agenda-turn-price">{money.format(turn.amount)}</strong> : null}
        {canUseOperationalActions ? <div className="agenda-primary-action">{turn.phone && !["Cancelado", "Finalizado"].includes(turn.status) ? <a href={turn.status === "Listo" ? readyTurnWhatsAppLink(turn, settings?.readyMessageTemplate, settings?.openingHours) : turnConfirmationWhatsAppLink(turn, settings?.businessName, settings?.confirmationMessageTemplate)} target="_blank" rel="noreferrer"><MessageCircle size={18} /> {turn.status === "Listo" ? "Avisar vehículo listo" : "Confirmar turno"}</a> : <span>Sin acción de WhatsApp</span>}</div> : null}
        {onEditTurn || onGenerateReceipt || onDeleteTurn ? <footer>{onEditTurn ? <button type="button" onClick={() => onEditTurn(turn)}><Pencil size={16} /> Editar</button> : null}{onGenerateReceipt ? <button type="button" onClick={() => onGenerateReceipt(turn)}><ReceiptText size={16} /> Recibo</button> : null}{onDeleteTurn ? <button className="danger" type="button" onClick={() => onDeleteTurn(turn.id)} aria-label="Eliminar turno"><Trash2 size={16} /></button> : null}</footer> : null}
      </article>)}
      {!visibleTurns.length ? <div className="agenda-empty"><CalendarDays size={35} /><h3>No hay turnos para este día</h3><p>Elegí otra fecha o agregá un turno nuevo.</p></div> : null}
    </section>
  </div>;
}
