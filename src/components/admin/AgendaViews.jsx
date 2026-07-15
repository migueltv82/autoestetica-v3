import { useMemo } from "react";
import { ArrowRight, CalendarDays, Car, ChevronLeft, ChevronRight, Clock3, MessageCircle, Pencil, Trash2, User } from "lucide-react";
import TurnsTable from "./TurnsTable";
import { getTodayString } from "../../utils/date";
import "./AgendaViews.css";

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const BOARD_COLUMNS = [
  { key: "pending", label: "Por confirmar", statuses: ["Consulta", "Pendiente", "Seña pendiente"], next: "Confirmado", tone: "amber" },
  { key: "confirmed", label: "Confirmados", statuses: ["Confirmado"], next: "En proceso", tone: "blue" },
  { key: "progress", label: "En proceso", statuses: ["En proceso"], next: "Listo", tone: "purple" },
  { key: "ready", label: "Listos", statuses: ["Listo"], next: "Finalizado", tone: "green" },
  { key: "done", label: "Entregados", statuses: ["Finalizado"], next: null, tone: "gray" },
];

function startOfWeek(baseDate) {
  const date = new Date(`${baseDate}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
}
function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function waLink(turn) {
  const phone = String(turn.phone || "").replace(/\D/g, "");
  const normalized = phone.startsWith("54") ? phone : `549${phone.replace(/^0/, "")}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(`Hola ${turn.client}, te escribimos de Autoestética Tucumán por tu turno.`)}`;
}

export function TodayAgenda({ turns, onStatusChange, onDeleteTurn, onGenerateReceipt, onEditTurn }) {
  const today = getTodayString();
  const todayTurns = turns.filter((turn) => turn.date === today);
  const pending = todayTurns.filter((turn) => ["Consulta", "Pendiente", "Seña pendiente"].includes(turn.status)).length;
  return (
    <div className="agenda-view-content">
      <div className="agenda-summary-line"><span><strong>{todayTurns.length}</strong> trabajos para hoy</span><span><strong>{pending}</strong> por confirmar</span><span><strong>{todayTurns.filter((turn) => turn.status === "Listo").length}</strong> listos para entregar</span></div>
      <TurnsTable turns={todayTurns} onStatusChange={onStatusChange} onDeleteTurn={onDeleteTurn} onGenerateReceipt={onGenerateReceipt} onEditTurn={onEditTurn} />
    </div>
  );
}

export function WeekAgenda({ turns, weekOffset, onWeekChange, onStatusChange, onEditTurn, onDeleteTurn }) {
  const days = useMemo(() => {
    const monday = startOfWeek(getTodayString());
    monday.setDate(monday.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday); date.setDate(monday.getDate() + index); return date;
    });
  }, [weekOffset]);
  const rangeLabel = `${days[0].toLocaleDateString("es-AR", { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}`;
  return (
    <div className="agenda-view-content">
      <div className="week-controls"><button type="button" onClick={() => onWeekChange(weekOffset - 1)} aria-label="Semana anterior"><ChevronLeft size={18} /></button><strong>{rangeLabel}</strong><button type="button" onClick={() => onWeekChange(weekOffset + 1)} aria-label="Semana siguiente"><ChevronRight size={18} /></button>{weekOffset !== 0 ? <button type="button" className="week-today" onClick={() => onWeekChange(0)}>Esta semana</button> : null}</div>
      <div className="week-grid">
        {days.map((day) => {
          const key = dateKey(day); const dayTurns = turns.filter((turn) => turn.date === key && turn.status !== "Cancelado"); const isToday = key === getTodayString();
          return <section className={`week-day ${isToday ? "is-today" : ""}`} key={key}><header><span>{day.toLocaleDateString("es-AR", { weekday: "short" })}</span><strong>{day.getDate()}</strong><small>{dayTurns.length} turnos</small></header><div className="week-day-list">{dayTurns.length ? dayTurns.map((turn) => <article className={`week-turn status-${turn.status.toLowerCase().replaceAll(" ", "-")}`} key={turn.id}><div className="week-turn-heading"><div className="week-turn-time"><Clock3 size={12} />{turn.time}</div><div className="week-turn-actions"><button type="button" onClick={() => onEditTurn(turn)} title="Editar turno"><Pencil size={13} /></button><button type="button" className="danger" onClick={() => onDeleteTurn(turn.id)} title="Eliminar turno"><Trash2 size={13} /></button></div></div><strong>{turn.client}</strong><span>{turn.vehicle} · {turn.service}</span><select value={turn.status} onChange={(event) => onStatusChange(turn.id, event.target.value)}><option>Pendiente</option><option>Confirmado</option><option>En proceso</option><option>Listo</option><option>Finalizado</option><option>Cancelado</option></select></article>) : <div className="week-empty">Disponible</div>}</div></section>;
        })}
      </div>
    </div>
  );
}

export function BoardAgenda({ turns, onStatusChange }) {
  return (
    <div className="board-scroll"><div className="agenda-board">
      {BOARD_COLUMNS.map((column) => {
        const columnTurns = turns.filter((turn) => column.statuses.includes(turn.status));
        return <section className={`board-column tone-${column.tone}`} key={column.key}><header><span className="board-dot" /><strong>{column.label}</strong><small>{columnTurns.length}</small></header><div className="board-list">{columnTurns.map((turn) => <article className="board-card" key={turn.id}><div className="board-card-top"><span><CalendarDays size={13} />{turn.date} · {turn.time}</span><a href={waLink(turn)} target="_blank" rel="noreferrer" title="Abrir WhatsApp"><MessageCircle size={15} /></a></div><h3>{turn.client}</h3><p><Car size={14} />{turn.vehicle}</p><p className="board-service">{turn.service}</p>{turn.amount > 0 ? <strong className="board-price">{money.format(turn.amount)}</strong> : null}{column.next ? <button type="button" onClick={() => onStatusChange(turn.id, column.next)}>{column.next}<ArrowRight size={14} /></button> : <span className="board-complete"><User size={14} /> Trabajo entregado</span>}</article>)}{!columnTurns.length ? <div className="board-empty">Sin vehículos</div> : null}</div></section>;
      })}
    </div></div>
  );
}
