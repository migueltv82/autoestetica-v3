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
import "./Dashboard.css";

function Dashboard() {
  const { turns, isLoading, updateTurnStatus, deleteTurn } = useTurns();
  const { clients } = useClients();
  const { transactions } = useCash();

  const today = "2026-03-25"; 

  const todaysTurns = useMemo(() => {
    return turns.filter((t) => t.date === today);
  }, [turns]);

  const confirmedTurns = useMemo(() => {
    return todaysTurns.filter(t => t.status === "Confirmado").length;
  }, [todaysTurns]);

  const pendingTurns = useMemo(() => {
    return todaysTurns.filter(t => t.status === "Pendiente").length;
  }, [todaysTurns]);

  const financialSummary = useMemo(() => {
    const incomes = transactions.filter(t => t.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = transactions.filter(t => t.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
    return { incomes, expenses, balance: incomes - expenses };
  }, [transactions]);

  const formatMoney = (val) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(val);

  return (
    <PageTransition>
      <AdminLayout
        title="Panel de Control"
        subtitle="Resumen general de la operativa de tu negocio en tiempo real."
      >
        <section className="admin-stats-grid">
          <StatCard label="Turnos de Hoy" value={isLoading ? "-" : todaysTurns.length} icon={<Calendar size={20} />} trend="Agenda del día" />
          <StatCard label="Clientes Totales" value={clients.length} icon={<Users size={20} />} trend="+12 este mes" />
          <StatCard label="Balance del Mes" value={formatMoney(financialSummary.balance)} icon={<Wallet size={20} />} trend="Actualizado" />
          <StatCard label="Ingresos de Hoy" value={formatMoney(financialSummary.incomes)} icon={<TrendingUp size={20} />} />
        </section>

        <section className="dashboard-panel dashboard-section-spacer">
          <div className="dashboard-heading">
            <div className="dashboard-heading-left">
              <div className="dashboard-heading-icon">
                <Clock size={24} />
              </div>
              <div className="dashboard-heading-info">
                <h2>Agenda Operativa</h2>
                <p>Mostrando los próximos turnos programados del día.</p>
              </div>
            </div>
            <Link to="/admin/turnos" className="btn-premium" style={{ height: "42px", padding: "0 1.5rem" }}>
              <span>Ver agenda completa</span>
            </Link>
          </div>
          
          {isLoading ? (
            <TurnsTableSkeleton />
          ) : turns.length > 0 ? (
            <TurnsTable
              turns={turns.slice(0, 10)}
              onStatusChange={updateTurnStatus}
              onDeleteTurn={deleteTurn}
            />
          ) : (
            <div className="empty-state-container">
              <Calendar size={48} style={{ opacity: 0.1, marginBottom: "1rem" }} />
              <p>No hay turnos agendados para los próximos días.</p>
            </div>
          )}
        </section>

        <div className="dashboard-secondary-grid dashboard-section-spacer">
          <section className="dashboard-panel section-sm">
            <h3 className="panel-subtitle"><Zap size={16} /> Estado de Turnos</h3>
            <div className="status-summary-cards">
              <div className="status-mini-card green">
                <CheckCircle2 size={18} />
                <span>{confirmedTurns} Confirmados</span>
              </div>
              <div className="status-mini-card orange">
                <Clock size={18} />
                <span>{pendingTurns} Pendientes</span>
              </div>
            </div>
          </section>

          <section className="dashboard-panel section-sm">
            <h3 className="panel-subtitle"><Plus size={16} /> Acciones rápidas</h3>
            <div className="quick-actions-list-horizontal">
              <Link to="/admin/turnos" className="action-item-compact">
                <Plus size={20} /> <span>Nuevo Turno</span>
              </Link>
              <Link to="/admin/clientes" className="action-item-compact">
                <Users size={20} /> <span>Registrar Cliente</span>
              </Link>
              <Link to="/admin/caja" className="action-item-compact">
                <Wallet size={20} /> <span>Movimientos</span>
              </Link>
            </div>
          </section>

          <section className="dashboard-panel section-sm">
            <h3 className="panel-subtitle"><Database size={16} /> Infraestructura</h3>
            <div className="status-indicators">
              <div className="indicator-item">
                <span className="dot active"></span>
                <span>Servidor Cloud</span>
              </div>
              <div className="indicator-item">
                <span className="dot warning"></span>
                <span>Base de Datos</span>
              </div>
              <div className="indicator-item">
                <span className="dot active"></span>
                <span>SSL Security</span>
              </div>
            </div>
          </section>
        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default Dashboard;