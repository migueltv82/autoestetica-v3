import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import TurnsTable from "../../components/admin/TurnsTable";
import TurnsTableSkeleton from "../../components/admin/TurnsTableSkeleton";
import { useTurns } from "../../hooks/useTurns";
import { useClients } from "../../hooks/useClients";
import { useCash } from "../../hooks/useCash";
import { useSettings } from "../../hooks/useSettings";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuth } from "../../hooks/useAuth";
import { getTodayString, shiftDateByDays } from "../../utils/date";
import "./Dashboard.css";

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function Dashboard() {
  const { turns, isLoading, error: turnsError, updateTurnStatus, deleteTurn } = useTurns();
  const { totalClients, error: clientsError } = useClients();
  const { transactions, receivables, error: cashError } = useCash();
  const { settings } = useSettings();
  const { user, profile } = useAuth();
  const { canManageFinance, canManageCatalog, canDeleteTurns } = usePermissions();
  const today = getTodayString();
  const yesterday = shiftDateByDays(-1);

  const summary = useMemo(() => {
    const todaysTurns = turns
      .filter((turn) => turn.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
    const upcomingTurns = turns
      .filter((turn) => turn.date > today && turn.status !== "Cancelado")
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    const todayTransactions = transactions.filter((transaction) => transaction.date === today);
    const yesterdayIncome = transactions
      .filter((transaction) => transaction.date === yesterday && transaction.type === "income")
      .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
    const income = todayTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
    const expenses = todayTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
    const pending = todaysTurns.filter((turn) => turn.status === "Pendiente").length;
    const confirmed = todaysTurns.filter((turn) => turn.status === "Confirmado").length;
    const completed = todaysTurns.filter((turn) => turn.status === "Finalizado").length;
    const activeTurns = todaysTurns.filter((turn) => turn.status !== "Cancelado").length;
    const outstanding = receivables.reduce((total, order) => total + Number(order.balance || 0), 0);

    return {
      todaysTurns,
      upcomingTurns,
      recentTransactions: [...todayTransactions].slice(0, 4),
      income,
      expenses,
      net: income - expenses,
      yesterdayIncome,
      pending,
      confirmed,
      completed,
      activeTurns,
      outstanding,
      pendingPayments: receivables.length,
    };
  }, [turns, transactions, receivables, today, yesterday]);

  const incomeVariation = summary.yesterdayIncome
    ? Math.round(((summary.income - summary.yesterdayIncome) / summary.yesterdayIncome) * 100)
    : null;
  const completionRate = summary.activeTurns
    ? Math.round((summary.completed / summary.activeTurns) * 100)
    : 0;
  const currentHour = Number(new Intl.DateTimeFormat("es-AR", { hour: "2-digit", hour12: false, timeZone: "America/Argentina/Tucuman" }).format(new Date()));
  const greeting = currentHour < 12 ? "Buen día" : currentHour < 19 ? "Buenas tardes" : "Buenas noches";
  const userName = profile?.full_name?.trim()
    || user?.user_metadata?.full_name?.trim()
    || user?.user_metadata?.name?.trim()
    || user?.email?.split("@")[0]
    || "Usuario";
  const dataError = turnsError || clientsError || (canManageFinance ? cashError : null);

  return (
    <PageTransition>
      <AdminLayout>
        <div className="dashboard">
          <header className="dashboard-header">
            <div>
              <span className="dashboard-eyebrow">Resumen del negocio</span>
              <h1>{greeting}, {userName}</h1>
              <p>
                {new Date().toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <Link to="/admin/turnos" className="btn-primary-admin">
              <Plus size={18} /> Agendar turno
            </Link>
          </header>

          {dataError ? <div className="dashboard-data-alert" role="alert"><CircleAlert size={17} /><span>No pudimos actualizar una parte del resumen. Revisá tu conexión y volvé a intentar.</span></div> : null}

          <section className="dashboard-kpis" aria-label="Indicadores principales">
            <article className="dashboard-kpi kpi-agenda">
              <div className="kpi-topline"><span>Agenda de hoy</span><CalendarDays size={19} /></div>
              <strong>{isLoading ? "—" : summary.activeTurns}</strong>
              <p>{summary.confirmed} confirmados · {summary.pending} pendientes</p>
            </article>
            {canManageFinance ? <article className="dashboard-kpi kpi-income">
              <div className="kpi-topline"><span>Ingresos registrados</span><TrendingUp size={19} /></div>
              <strong>{moneyFormatter.format(summary.income)}</strong>
              <p className={incomeVariation !== null && incomeVariation < 0 ? "negative" : "positive"}>
                {incomeVariation === null ? "Sin base para comparar ayer" : `${incomeVariation >= 0 ? "+" : ""}${incomeVariation}% frente a ayer`}
              </p>
            </article> : null}
            {canManageFinance ? <article className="dashboard-kpi kpi-balance">
              <div className="kpi-topline"><span>Resultado neto de hoy</span><Wallet size={19} /></div>
              <strong>{moneyFormatter.format(summary.net)}</strong>
              <p>{moneyFormatter.format(summary.expenses)} en gastos registrados</p>
            </article> : null}
            <article className="dashboard-kpi kpi-clients">
              <div className="kpi-topline"><span>Clientes registrados</span><Users size={19} /></div>
              <strong>{totalClients}</strong>
              <p>Base total de clientes</p>
            </article>
            {canManageFinance ? <article className="dashboard-kpi kpi-receivable">
              <div className="kpi-topline"><span>Saldo por cobrar</span><Banknote size={19} /></div>
              <strong>{moneyFormatter.format(summary.outstanding)}</strong>
              <p>{summary.pendingPayments} {summary.pendingPayments === 1 ? "orden pendiente" : "órdenes pendientes"}</p>
            </article> : null}
          </section>

          <section className="dashboard-status-strip">
            <div>
              <span className="status-strip-label">Progreso de la jornada</span>
              <strong>{completionRate}% completado</strong>
            </div>
            <progress className="status-progress" max="100" value={completionRate} aria-label={`${completionRate}% de turnos completados`} />
            <div className="status-counts">
              <span><CheckCircle2 size={15} /> {summary.completed} finalizados</span>
              <span><Clock3 size={15} /> {summary.confirmed} confirmados</span>
              <span><CircleAlert size={15} /> {summary.pending} por confirmar</span>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-panel dashboard-agenda">
              <div className="panel-heading">
                <div><span>Operación</span><h2>Agenda de hoy</h2></div>
                <Link to="/admin/turnos">Ver agenda <ArrowRight size={15} /></Link>
              </div>
              {isLoading ? (
                <TurnsTableSkeleton />
              ) : summary.todaysTurns.length ? (
                <TurnsTable turns={summary.todaysTurns.slice(0, 5)} onStatusChange={updateTurnStatus} onDeleteTurn={canDeleteTurns ? deleteTurn : null} />
              ) : (
                <div className="dashboard-empty"><CalendarDays size={28} /><strong>La agenda está libre</strong><span>No hay turnos cargados para hoy.</span></div>
              )}
            </div>

            <aside className="dashboard-side">
              <div className="dashboard-panel">
                <div className="panel-heading compact"><div><span>Atención</span><h2>Prioridades</h2></div></div>
                <div className="priority-list">
                  <Link to="/admin/turnos" className={summary.pending ? "priority-item warning" : "priority-item success"}>
                    <span className="priority-icon">{summary.pending ? <CircleAlert size={18} /> : <CheckCircle2 size={18} />}</span>
                    <span><strong>{summary.pending ? `${summary.pending} turno${summary.pending > 1 ? "s" : ""} sin confirmar` : "Agenda confirmada"}</strong><small>{summary.pending ? "Revisá la agenda de hoy" : "No hay confirmaciones pendientes"}</small></span>
                    <ArrowRight size={15} />
                  </Link>
                  {canManageFinance ? <Link to="/admin/caja" className="priority-item">
                    <span className="priority-icon"><Wallet size={18} /></span>
                    <span><strong>{summary.recentTransactions.length ? `${summary.recentTransactions.length} movimientos hoy` : "Caja sin movimientos"}</strong><small>Ingresos y egresos registrados</small></span>
                    <ArrowRight size={15} />
                  </Link> : null}
                  {canManageFinance && summary.pendingPayments ? <Link to="/admin/caja" className="priority-item warning">
                    <span className="priority-icon"><Banknote size={18} /></span>
                    <span><strong>{moneyFormatter.format(summary.outstanding)} por cobrar</strong><small>{summary.pendingPayments} {summary.pendingPayments === 1 ? "trabajo con saldo" : "trabajos con saldo"}</small></span>
                    <ArrowRight size={15} />
                  </Link> : null}
                </div>
              </div>

              <div className="dashboard-panel">
                <div className="panel-heading compact"><div><span>Accesos</span><h2>Acciones rápidas</h2></div></div>
                <div className="quick-actions">
                  <Link to="/admin/turnos"><CalendarDays size={18} /><span>Nuevo turno</span></Link>
                  <Link to="/admin/clientes"><UserPlus size={18} /><span>Nuevo cliente</span></Link>
                  {canManageFinance ? <Link to="/admin/caja"><Wallet size={18} /><span>Registrar movimiento</span></Link> : null}
                  {canManageCatalog ? <Link to="/admin/servicios"><Plus size={18} /><span>Gestionar servicios</span></Link> : null}
                </div>
              </div>
            </aside>
          </section>

          <section className={`dashboard-lower-grid${canManageFinance ? "" : " single"}`}>
            {canManageFinance ? <div className="dashboard-panel">
              <div className="panel-heading"><div><span>Caja diaria</span><h2>Últimos movimientos</h2></div><Link to="/admin/caja">Ver caja <ArrowRight size={15} /></Link></div>
              {summary.recentTransactions.length ? (
                <div className="movement-list">
                  {summary.recentTransactions.map((transaction) => (
                    <div className="movement-row" key={transaction.id}>
                      <span className={`movement-icon ${transaction.type}`}>{transaction.type === "income" ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}</span>
                      <span className="movement-description"><strong>{transaction.description}</strong><small>{transaction.method}</small></span>
                      <strong className={transaction.type}>{transaction.type === "income" ? "+" : "−"}{moneyFormatter.format(transaction.amount)}</strong>
                    </div>
                  ))}
                </div>
              ) : <div className="dashboard-empty small"><Wallet size={24} /><span>Todavía no hay movimientos cargados hoy.</span></div>}
            </div> : null}

            <div className="dashboard-panel">
              <div className="panel-heading"><div><span>Próximos días</span><h2>Siguiente agenda</h2></div><Link to="/admin/turnos">Ver todo <ArrowRight size={15} /></Link></div>
              {summary.upcomingTurns.length ? (
                <div className="upcoming-list">
                  {summary.upcomingTurns.slice(0, 4).map((turn) => (
                    <div className="upcoming-row" key={turn.id}>
                      <span className="upcoming-date"><strong>{new Date(`${turn.date}T12:00:00`).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}</strong><small>{turn.time}</small></span>
                      <span><strong>{turn.client}</strong><small>{turn.service} · {turn.vehicle}</small></span>
                      <span className={`mini-status ${turn.status.toLowerCase()}`}>{turn.status}</span>
                    </div>
                  ))}
                </div>
              ) : <div className="dashboard-empty small"><CalendarDays size={24} /><span>No hay turnos futuros cargados.</span></div>}
            </div>
          </section>
        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default Dashboard;
