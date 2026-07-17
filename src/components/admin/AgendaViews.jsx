import { useMemo } from "react";
import { ArrowRight, CalendarDays, Car, ChevronLeft, ChevronRight, Clock3, MessageCircle, Pencil, Trash2, User } from "lucide-react";
import TurnsTable from "./TurnsTable";
import { getTodayString } from "../../utils/date";
import { appointmentWhatsAppLink, readyTurnWhatsAppLink, turnConfirmationWhatsAppLink } from "../../utils/whatsapp";
import "./AgendaViews.css";
import "./MonthAgenda.css";

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
export function TodayAgenda({ turns, onStatusChange, onDeleteTurn, onGenerateReceipt, onEditTurn }) {
  const today = getTodayString();
  const todayTurns = turns.filter((turn) => turn.date === today);
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const overdue = todayTurns.filter((turn) => ["Consulta", "Pendiente", "Seña pendiente"].includes(turn.status) && Number(turn.time.slice(0, 2)) * 60 + Number(turn.time.slice(3, 5)) <= nowMinutes).length;
  const pending = todayTurns.filter((turn) => ["Consulta", "Pendiente", "Seña pendiente"].includes(turn.status)).length;
  return (
    <div className="agenda-view-content">
      <div className="agenda-summary-line"><span><strong>{todayTurns.length}</strong> trabajos para hoy</span><span><strong>{pending}</strong> por confirmar</span><span className={overdue ? "agenda-alert" : ""}><strong>{overdue}</strong> pendientes vencidos</span><span><strong>{todayTurns.filter((turn) => turn.status === "Listo").length}</strong> listos para entregar</span></div>
      <TurnsTable turns={todayTurns} onStatusChange={onStatusChange} onDeleteTurn={onDeleteTurn} onGenerateReceipt={onGenerateReceipt} onEditTurn={onEditTurn} />
    </div>
  );
}

export function WeekAgenda({ turns, weekOffset, onWeekChange, onStatusChange, onEditTurn, onDeleteTurn, settings }) {
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
          return <section className={`week-day ${isToday ? "is-today" : ""}`} key={key}><header><span>{day.toLocaleDateString("es-AR", { weekday: "short" })}</span><strong>{day.getDate()}</strong><small>{dayTurns.length} turnos</small></header><div className="week-day-list">{dayTurns.length ? dayTurns.map((turn) => <article className={`week-turn status-${turn.status.toLowerCase().replaceAll(" ", "-")}`} key={turn.id}><div className="week-turn-heading"><div className="week-turn-time"><Clock3 size={12} />{turn.time}–{turn.endTime}</div><div className="week-turn-actions"><a href={turn.status === "Listo" ? readyTurnWhatsAppLink(turn, settings?.readyMessageTemplate, settings?.openingHours) : turnConfirmationWhatsAppLink(turn, settings?.businessName, settings?.confirmationMessageTemplate)} target="_blank" rel="noreferrer" title={turn.status === "Listo" ? "Avisar vehículo listo" : "Confirmar turno"}><MessageCircle size={13} /></a><button type="button" onClick={() => onEditTurn(turn)} title="Editar turno"><Pencil size={13} /></button><button type="button" className="danger" onClick={() => onDeleteTurn(turn.id)} title="Eliminar turno"><Trash2 size={13} /></button></div></div><strong>{turn.client}</strong><span>{turn.vehicle} · {turn.service}</span><select value={turn.status} onChange={(event) => onStatusChange(turn.id, event.target.value)}><option>Pendiente</option><option>Confirmado</option><option>En proceso</option><option>Listo</option><option>Finalizado</option><option>Cancelado</option></select></article>) : <div className="week-empty">Disponible</div>}</div></section>;
        })}
      </div>
    </div>
  );
}

export function MonthAgenda({ turns, monthOffset, onMonthChange, onEditTurn }) {
  const { days, label } = useMemo(() => {
    const base = new Date();
    const first = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
    const gridStart = new Date(first);
    const mondayIndex = (first.getDay() + 6) % 7;
    gridStart.setDate(first.getDate() - mondayIndex);
    return {
      label: first.toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
      days: Array.from({ length: 42 }, (_, index) => { const day = new Date(gridStart); day.setDate(gridStart.getDate() + index); return { date: day, currentMonth: day.getMonth() === first.getMonth() }; }),
    };
  }, [monthOffset]);
  const today = getTodayString();
  return <div className="agenda-view-content month-agenda">
    <div className="week-controls"><button type="button" onClick={() => onMonthChange(monthOffset - 1)} aria-label="Mes anterior"><ChevronLeft size={18} /></button><strong>{label}</strong><button type="button" onClick={() => onMonthChange(monthOffset + 1)} aria-label="Mes siguiente"><ChevronRight size={18} /></button>{monthOffset !== 0 ? <button type="button" className="week-today" onClick={() => onMonthChange(0)}>Este mes</button> : null}</div>
    <div className="month-weekdays">{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => <span key={day}>{day}</span>)}</div>
    <div className="month-grid">{days.map(({ date, currentMonth }) => {
      const key = dateKey(date);
      const dayTurns = turns.filter((turn) => turn.date === key && turn.status !== "Cancelado");
      return <section key={key} className={`month-day ${currentMonth ? "" : "outside"} ${key === today ? "is-today" : ""}`}><header><strong>{date.getDate()}</strong>{dayTurns.length ? <small>{dayTurns.length}</small> : null}</header><div>{dayTurns.slice(0, 3).map((turn) => <button type="button" key={turn.id} className={`month-turn status-${turn.status.toLowerCase().replaceAll(" ", "-")}`} onClick={() => onEditTurn(turn)} title={`${turn.time} · ${turn.client} · ${turn.service}`}><span>{turn.time}</span>{turn.client}</button>)}{dayTurns.length > 3 ? <small className="month-more">+{dayTurns.length - 3} más</small> : null}</div></section>;
    })}</div>
  </div>;
}

export function BoardAgenda({ turns, onStatusChange }) {
  return (
    <div className="board-scroll"><div className="agenda-board">
      {BOARD_COLUMNS.map((column) => {
        const columnTurns = turns.filter((turn) => column.statuses.includes(turn.status));
        return <section className={`board-column tone-${column.tone}`} key={column.key}><header><span className="board-dot" /><strong>{column.label}</strong><small>{columnTurns.length}</small></header><div className="board-list">{columnTurns.map((turn) => <article className="board-card" key={turn.id}><div className="board-card-top"><span><CalendarDays size={13} />{turn.date} · {turn.time}</span><a href={appointmentWhatsAppLink(turn)} target="_blank" rel="noreferrer" title="Abrir WhatsApp"><MessageCircle size={15} /></a></div><h3>{turn.client}</h3><p><Car size={14} />{turn.vehicle}</p><p className="board-service">{turn.service}</p>{turn.amount > 0 ? <strong className="board-price">{money.format(turn.amount)}</strong> : null}{column.next ? <button type="button" onClick={() => onStatusChange(turn.id, column.next)}>{column.next}<ArrowRight size={14} /></button> : <span className="board-complete"><User size={14} /> Trabajo entregado</span>}</article>)}{!columnTurns.length ? <div className="board-empty">Sin vehículos</div> : null}</div></section>;
      })}
    </div></div>
  );
}
