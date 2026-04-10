import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, Wallet, Calendar, TrendingUp, CheckCircle2, Clock, Zap, Database } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/ui/StatCard";
import PageTransition from "../../components/ui/PageTransition";
import TurnsTable from "../../components/admin/TurnsTable";
import TurnsTableSkeleton from "../../components/admin/TurnsTableSkeleton";
import { useTurns } from "../../hooks/useTurns";
import { useClients } from "../../hooks/useClients";
import { useCash } from "../../hooks/useCash";
import { getTodayString } from "../../utils/date";
import "./Dashboard.css";

function Dashboard() {
  const { turns, isLoading, updateTurnStatus, deleteTurn } = useTurns();
  const { clients } = useClients();
  const { transactions } = useCash();

  const today = getTodayString();

  const todaysTurns = useMemo(() => turns.filter((turn) => turn.date === today), [turns, today]);
  const todaysTransactions = useMemo(() => transactions.filter((transaction) => transaction.date === today), [transactions, today]);
  const confirmedTurns = useMemo(() => todaysTurns.filter((turn) => turn.status === "Confirmado").length, [todaysTurns]);
  const pendingTurns = useMemo(() => todaysTurns.filter((turn) => turn.status === "Pendiente").length, [todaysTurns]);

  const financialSummary = useMemo(() => {
    const incomes = transactions.filter((transaction) => transaction.type === "income").reduce((accumulator, current) => accumulator + current.amount, 0);
    const expenses = transactions.filter((transaction) => transaction.type === "expense").reduce((accumulator, current) => accumulator + current.amount, 0);
    const todayIncome = todaysTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((accumulator, current) => accumulator + current.amount, 0);

    return {
      incomes,
      expenses,
      balance: incomes - expenses,
      todayIncome,
    };
  }, [transactions, todaysTransactions]);

  const formatMoney = (value) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(value);

  return (
    <PageTransition>
      <AdminLayout
        title="Panel de Control"
        subtitle="Resumen operativo del negocio, con foco en agenda, clientes y caja del dia."
      >
        <section className="admin-stats-grid">
          <StatCard label="Turnos de hoy" value={isLoading ? "-" : todaysTurns.length} icon={<Calendar size={20} />} trend="Agenda actual" />
          <StatCard label="Clientes totales" value={clients.length} icon={<Users size={20} />} trend="Base activa" />
          <StatCard label="Balance del mes" value={formatMoney(financialSummary.balance)} icon={<Wallet size={20} />} trend="Caja consolidada" />
          <StatCard label="Ingresos de hoy" value={formatMoney(financialSummary.todayIncome)} icon={<TrendingUp size={20} />} trend="Cobros del dia" />
        </section>

        <section className="dashboard-panel dashboard-section-spacer">
          <div className="dashboard-heading">
            <div className="dashboard-heading-left">
              <div className="dashboard-heading-icon">
                <Clock size={22} />
              </div>
              <div className="dashboard-heading-info">
                <h2>Agenda operativa</h2>
                <p>Vista rapida de los turnos del dia con control directo de estados.</p>
              </div>
            </div>
            <Link to="/admin/turnos" className="btn-premium dashboard-link-btn">
              Ver agenda completa
            </Link>
          </div>

          {isLoading ? (
            <TurnsTableSkeleton />
          ) : todaysTurns.length > 0 ? (
            <TurnsTable
              turns={todaysTurns.slice(0, 10)}
              onStatusChange={updateTurnStatus}
              onDeleteTurn={deleteTurn}
            />
          ) : (
            <div className="admin-empty-state">
              <Calendar size={48} />
              <p>No hay turnos cargados para hoy.</p>
            </div>
          )}
        </section>

        <div className="dashboard-secondary-grid dashboard-section-spacer">
          <section className="dashboard-panel section-sm">
            <h3 className="panel-subtitle">
              <Zap size={16} /> Estado de turnos
            </h3>
            <div className="status-summary-cards">
              <div className="status-mini-card green">
                <CheckCircle2 size={18} />
                <span>{confirmedTurns} confirmados</span>
              </div>
              <div className="status-mini-card orange">
                <Clock size={18} />
                <span>{pendingTurns} pendientes</span>
              </div>
            </div>
          </section>

          <section className="dashboard-panel section-sm">
            <h3 className="panel-subtitle">
              <Plus size={16} /> Acciones rapidas
            </h3>
            <div className="quick-actions-list-horizontal">
              <Link to="/admin/turnos" className="action-item-compact">
                <Plus size={20} /> <span>Nuevo turno</span>
              </Link>
              <Link to="/admin/clientes" className="action-item-compact">
                <Users size={20} /> <span>Registrar cliente</span>
              </Link>
              <Link to="/admin/caja" className="action-item-compact">
                <Wallet size={20} /> <span>Nuevo movimiento</span>
              </Link>
            </div>
          </section>

          <section className="dashboard-panel section-sm">
            <h3 className="panel-subtitle">
              <Database size={16} /> Infraestructura
            </h3>
            <div className="status-indicators">
              <div className="indicator-item">
                <span className="dot active"></span>
                <span>Servidor cloud</span>
              </div>
              <div className="indicator-item">
                <span className="dot warning"></span>
                <span>Base de datos</span>
              </div>
              <div className="indicator-item">
                <span className="dot active"></span>
                <span>SSL security</span>
              </div>
            </div>
          </section>
        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default Dashboard;
