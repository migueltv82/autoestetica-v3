import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, Wallet, Calendar, TrendingUp, CheckCircle2, Clock, Zap, ShieldCheck, Database } from "lucide-react";
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
          <StatCard label="Turnos de Hoy" value={isLoading ? "-" : todaysTurns.length} icon={<Calendar size={20} />} />
          <StatCard label="Clientes Totales" value={clients.length} icon={<Users size={20} />} />
          <StatCard label="Balance del Mes" value={formatMoney(financialSummary.balance)} icon={<Wallet size={20} />} />
          <StatCard label="Ingresos Estimados" value={formatMoney(financialSummary.incomes)} icon={<TrendingUp size={20} />} />
        </section>

        <section className="dashboard-panel" style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ padding: "0.5rem", background: "rgba(0, 191, 166, 0.1)", borderRadius: "10px", color: "var(--color-primary)" }}>
                <Clock size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Agenda Operativa</h2>
                <p style={{ color: "var(--color-text-soft)", fontSize: "0.95rem" }}>Mostrando los próximos 10 turnos programados.</p>
              </div>
            </div>
            <Link to="/admin/turnos" className="btn-premium" style={{ height: "42px", padding: "0 1.5rem" }}>
              Ver agenda completa
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
            <div style={{ textAlign: "center", padding: "5rem", color: "var(--color-text-soft)", fontStyle: "italic" }}>
              No hay turnos agendados para los próximos días.
            </div>
          )}
        </section>

        <div className="dashboard-secondary-grid" style={{ marginTop: "2rem" }}>
          <section className="dashboard-panel section-sm">
            <h3 className="panel-subtitle"><Zap size={16} /> Estado de Turnos</h3>
            <div className="status-summary-cards">
              <div className="status-mini-card green">
                <CheckCircle2 size={16} />
                <span>{confirmedTurns} Confirmados</span>
              </div>
              <div className="status-mini-card orange">
                <Clock size={16} />
                <span>{pendingTurns} Pendientes</span>
              </div>
            </div>
          </section>

          <section className="dashboard-panel section-sm">
            <h3 className="panel-subtitle"><Plus size={16} /> Acciones rápidas</h3>
            <div className="quick-actions-list-horizontal">
              <Link to="/admin/turnos" className="action-item-compact">
                <Plus size={18} /> Nuevo Turno
              </Link>
              <Link to="/admin/clientes" className="action-item-compact">
                <Users size={18} /> Registrar Cliente
              </Link>
              <Link to="/admin/caja" className="action-item-compact">
                <Wallet size={18} /> Nuevo Movimiento
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