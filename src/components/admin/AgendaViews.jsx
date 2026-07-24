import { useMemo } from "react";
import { ArrowRight, CalendarDays, Car, ChevronLeft, ChevronRight, Clock3, MessageCircle, Pencil, Trash2, User } from "lucide-react";
import TurnsTable from "./TurnsTable";
import { getTodayString, turnOccupiesDate } from "../../utils/date";
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

const WEEK_STATUS_OPTIONS = ["Pendiente", "Confirmado", "En proceso", "Listo", "Finalizado", "Cancelado"];

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

function dayDistance(from, to) {
  return Math.round((new Date(`${to}T12:00:00`) - new Date(`${from}T12:00:00`)) / 86400000);
}

export function TodayAgenda({ turns, onStatusChange, onDeleteTurn, onGenerateReceipt, onEditTurn, canUseOperationalActions = true }) {
  const today = getTodayString();
  const todayTurns = turns.filter((turn) => turnOccupiesDate(turn, today));
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const overdue = todayTurns.filter((turn) => ["Consulta", "Pendiente", "Seña pendiente"].includes(turn.status) && Number(turn.time.slice(0, 2)) * 60 + Number(turn.time.slice(3, 5)) <= nowMinutes).length;
  const pending = todayTurns.filter((turn) => ["Consulta", "Pendiente", "Seña pendiente"].includes(turn.status)).length;

  return (
    <div className="agenda-view-content">
      <div className="agenda-summary-line">
        <span><strong>{todayTurns.length}</strong> trabajos para hoy</span>
        <span><strong>{pending}</strong> por confirmar</span>
        <span className={overdue ? "agenda-alert" : ""}><strong>{overdue}</strong> pendientes vencidos</span>
        <span><strong>{todayTurns.filter((turn) => turn.status === "Listo").length}</strong> listos para entregar</span>
      </div>
      <TurnsTable
        turns={todayTurns}
        onStatusChange={onStatusChange}
        onDeleteTurn={onDeleteTurn}
        onGenerateReceipt={onGenerateReceipt}
        onEditTurn={onEditTurn}
        canUseOperationalActions={canUseOperationalActions}
      />
    </div>
  );
}

export function WeekAgenda({ turns, weekOffset, onWeekChange, onStatusChange, onEditTurn, onDeleteTurn, settings, canUseOperationalActions = true }) {
  const days = useMemo(() => {
    const monday = startOfWeek(getTodayString());
    monday.setDate(monday.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  }, [weekOffset]);
  const rangeLabel = `${days[0].toLocaleDateString("es-AR", { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}`;
  const weekStartKey = dateKey(days[0]);
  const weekEndKey = dateKey(days[6]);

  return (
    <div className="agenda-view-content">
      <div className="week-controls">
        <button type="button" onClick={() => onWeekChange(weekOffset - 1)} aria-label="Semana anterior"><ChevronLeft size={18} /></button>
        <strong>{rangeLabel}</strong>
        <button type="button" onClick={() => onWeekChange(weekOffset + 1)} aria-label="Semana siguiente"><ChevronRight size={18} /></button>
        {weekOffset !== 0 ? <button type="button" className="week-today" onClick={() => onWeekChange(0)}>Esta semana</button> : null}
      </div>
      <div className="week-grid">
        {days.map((day) => {
          const key = dateKey(day);
          const dayTurns = turns.filter((turn) => {
            if (turn.status === "Cancelado") return false;
            const turnEnd = turn.lastOccupiedDate || turn.endDate || turn.date;
            const visibleStart = turn.date < weekStartKey ? weekStartKey : turn.date;
            return turnEnd === turn.date ? turn.date === key : visibleStart === key && turn.date <= weekEndKey && turnEnd >= weekStartKey;
          });
          const occupiedCount = turns.filter((turn) => turnOccupiesDate(turn, key) && turn.status !== "Cancelado").length;
          const isToday = key === getTodayString();

          return (
            <section className={`week-day ${isToday ? "is-today" : ""}`} key={key}>
              <header>
                <span>{day.toLocaleDateString("es-AR", { weekday: "short" })}</span>
                <strong>{day.getDate()}</strong>
                <small>{occupiedCount} turnos</small>
              </header>
              <div className="week-day-list">
                {dayTurns.length ? dayTurns.map((turn) => (
                  <article className={`week-turn${(turn.lastOccupiedDate || turn.endDate || turn.date) > turn.date ? " is-spanning" : ""} status-${turn.status.toLowerCase().replaceAll(" ", "-")}`} style={{ "--week-span": Math.max(1, dayDistance(key, (turn.lastOccupiedDate || turn.endDate) > weekEndKey ? weekEndKey : (turn.lastOccupiedDate || turn.endDate || turn.date)) + 1) }} key={turn.id}>
                    <div className="week-turn-heading">
                      <div className="week-turn-time"><Clock3 size={12} />{turn.date === key ? turn.time : "En curso"}{turn.endDate === key ? `–${turn.endTime}` : turn.endDate !== turn.date ? ` · hasta ${turn.endDate}` : `–${turn.endTime}`}</div>
                      {canUseOperationalActions || onEditTurn || onDeleteTurn ? (
                        <div className="week-turn-actions">
                          {canUseOperationalActions ? (
                            <a
                              href={turn.status === "Listo" ? readyTurnWhatsAppLink(turn, settings?.readyMessageTemplate, settings?.openingHours) : turnConfirmationWhatsAppLink(turn, settings?.businessName, settings?.confirmationMessageTemplate)}
                              target="_blank"
                              rel="noreferrer"
                              title={turn.status === "Listo" ? "Avisar vehículo listo" : "Confirmar turno"}
                            >
                              <MessageCircle size={13} />
                            </a>
                          ) : null}
                          {onEditTurn ? <button type="button" onClick={() => onEditTurn(turn)} title="Editar turno"><Pencil size={13} /></button> : null}
                          {onDeleteTurn ? <button type="button" className="danger" onClick={() => onDeleteTurn(turn.id)} title="Eliminar turno"><Trash2 size={13} /></button> : null}
                        </div>
                      ) : null}
                    </div>
                    <strong>{turn.client}</strong>
                    <span>{turn.vehicle} · {turn.service}</span>
                    {onStatusChange ? (
                      <select value={turn.status} onChange={(event) => onStatusChange(turn.id, event.target.value)}>
                        {WEEK_STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    ) : <span className="week-readonly-status">{turn.status}</span>}
                  </article>
                )) : <div className="week-empty">Disponible</div>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function MonthAgenda({ turns, monthOffset, onMonthChange, onStatusChange, onEditTurn, onDeleteTurn, settings, canUseOperationalActions = true }) {
  const { days, label } = useMemo(() => {
    const base = new Date();
    const first = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
    const gridStart = new Date(first);
    const mondayIndex = (first.getDay() + 6) % 7;
    gridStart.setDate(first.getDate() - mondayIndex);
    return {
      label: first.toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
      days: Array.from({ length: 42 }, (_, index) => {
        const day = new Date(gridStart);
        day.setDate(gridStart.getDate() + index);
        return { date: day, currentMonth: day.getMonth() === first.getMonth() };
      }),
    };
  }, [monthOffset]);
  const today = getTodayString();
  const monthSegments = Array.from({ length: 6 }, (_, row) => {
    const rowStart = dateKey(days[row * 7].date);
    const rowEnd = dateKey(days[row * 7 + 6].date);
    return turns
      .filter((turn) => {
        const turnEnd = turn.lastOccupiedDate || turn.endDate || turn.date;
        return turn.status !== "Cancelado" && turnEnd > turn.date && turn.date <= rowEnd && turnEnd >= rowStart;
      })
      .map((turn, lane) => {
        const turnEnd = turn.lastOccupiedDate || turn.endDate;
        const visibleStart = turn.date < rowStart ? rowStart : turn.date;
        const visibleEnd = turnEnd > rowEnd ? rowEnd : turnEnd;
        return { turn, row, lane, startColumn: dayDistance(rowStart, visibleStart) + 1, endColumn: dayDistance(rowStart, visibleEnd) + 2 };
      });
  }).flat();

  return (
    <div className="agenda-view-content month-agenda">
      <div className="week-controls">
        <button type="button" onClick={() => onMonthChange(monthOffset - 1)} aria-label="Mes anterior"><ChevronLeft size={18} /></button>
        <strong>{label}</strong>
        <button type="button" onClick={() => onMonthChange(monthOffset + 1)} aria-label="Mes siguiente"><ChevronRight size={18} /></button>
        {monthOffset !== 0 ? <button type="button" className="week-today" onClick={() => onMonthChange(0)}>Este mes</button> : null}
      </div>
      <div className="month-weekdays">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="month-grid">
        {days.map(({ date, currentMonth }, index) => {
          const key = dateKey(date);
          const dayTurns = turns.filter((turn) => turnOccupiesDate(turn, key) && turn.status !== "Cancelado");
          const row = Math.floor(index / 7);
          const rowSegments = monthSegments.filter((segment) => segment.row === row);
          const laneCount = rowSegments.length;
          const startingSegments = rowSegments.filter((segment) => segment.startColumn === (index % 7) + 1);
          const displayTurns = dayTurns.filter((turn) => (turn.lastOccupiedDate || turn.endDate || turn.date) === turn.date && turn.date === key);

          return (
            <section key={key} style={{ "--month-lanes": Math.min(laneCount, 3) }} className={`month-day${laneCount ? " has-spans" : ""}${startingSegments.length ? " starts-span" : ""} ${currentMonth ? "" : "outside"} ${key === today ? "is-today" : ""}`}>
              <header>
                <strong>{date.getDate()}</strong>
                {dayTurns.length ? <small>{dayTurns.length}</small> : null}
              </header>
              {startingSegments.map(({ turn, lane, startColumn, endColumn }) => {
                const className = `month-span-turn status-${turn.status.toLowerCase().replaceAll(" ", "-")}`;
                const style = { "--month-span": endColumn - startColumn, "--month-lane": Math.min(lane, 2) };
                return <article key={`${turn.id}-${row}`} className={className} style={style}>
                  <div className="month-span-heading"><div className="week-turn-time"><Clock3 size={12} />{turn.date} {turn.time} → {turn.endDate} {turn.endTime}</div><div className="week-turn-actions">{canUseOperationalActions ? <a href={turn.status === "Listo" ? readyTurnWhatsAppLink(turn, settings?.readyMessageTemplate, settings?.openingHours) : turnConfirmationWhatsAppLink(turn, settings?.businessName, settings?.confirmationMessageTemplate)} target="_blank" rel="noreferrer" title="Abrir WhatsApp"><MessageCircle size={13} /></a> : null}{onEditTurn ? <button type="button" onClick={() => onEditTurn(turn)} title="Editar turno"><Pencil size={13} /></button> : null}{onDeleteTurn ? <button type="button" className="danger" onClick={() => onDeleteTurn(turn.id)} title="Eliminar turno"><Trash2 size={13} /></button> : null}</div></div>
                  <strong>{turn.client}</strong><span>{turn.vehicle} · {turn.service}</span>
                  {onStatusChange ? <select value={turn.status} onChange={(event) => onStatusChange(turn.id, event.target.value)}>{WEEK_STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}</select> : <span className="week-readonly-status">{turn.status}</span>}
                </article>;
              })}
              <div>
                {displayTurns.slice(0, 3).map((turn) => {
                  const className = `month-turn status-${turn.status.toLowerCase().replaceAll(" ", "-")}`;
                  const title = `${turn.time} · ${turn.client} · ${turn.service}`;
                  return onEditTurn ? (
                    <button type="button" key={turn.id} className={className} onClick={() => onEditTurn(turn)} title={title}>
                      <span>{turn.time}</span>{turn.client}
                    </button>
                  ) : (
                    <div key={turn.id} className={className} title={title}>
                      <span>{turn.time}</span>{turn.client}
                    </div>
                  );
                })}
                {dayTurns.length > 3 ? <small className="month-more">+{dayTurns.length - 3} más</small> : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function BoardAgenda({ turns, onStatusChange, canUseOperationalActions = true }) {
  return (
    <div className="board-scroll">
      <div className="agenda-board">
        {BOARD_COLUMNS.map((column) => {
          const columnTurns = turns.filter((turn) => column.statuses.includes(turn.status));

          return (
            <section className={`board-column tone-${column.tone}`} key={column.key}>
              <header><span className="board-dot" /><strong>{column.label}</strong><small>{columnTurns.length}</small></header>
              <div className="board-list">
                {columnTurns.map((turn) => (
                  <article className="board-card" key={turn.id}>
                    <div className="board-card-top">
                      <span><CalendarDays size={13} />{turn.date} · {turn.time}</span>
                      {canUseOperationalActions ? <a href={appointmentWhatsAppLink(turn)} target="_blank" rel="noreferrer" title="Abrir WhatsApp"><MessageCircle size={15} /></a> : null}
                    </div>
                    <h3>{turn.client}</h3>
                    <p><Car size={14} />{turn.vehicle}</p>
                    <p className="board-service">{turn.service}</p>
                    {turn.amount > 0 ? <strong className="board-price">{money.format(turn.amount)}</strong> : null}
                    {column.next && onStatusChange ? <button type="button" onClick={() => onStatusChange(turn.id, column.next)}>{column.next}<ArrowRight size={14} /></button> : <span className="board-complete"><User size={14} /> Trabajo entregado</span>}
                  </article>
                ))}
                {!columnTurns.length ? <div className="board-empty">Sin vehículos</div> : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
