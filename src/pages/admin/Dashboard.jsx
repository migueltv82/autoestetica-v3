import { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Users, 
  Wallet, 
  Calendar, 
  ArrowRight, 
  Clock, 
  TrendingUp 
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
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
  const { totalClients } = useClients();
  const { transactions } = useCash();

  const today = getTodayString();
  const todaysTurns = useMemo(() => turns.filter((turn) => turn.date === today), [turns, today]);
  
  const stats = useMemo(() => {
    const todayIncome = transactions
      .filter(t => t.date === today && t.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    return {
      todayTurns: todaysTurns.length,
      clients: totalClients,
      income: todayIncome
    };
  }, [todaysTurns, totalClients, transactions, today]);

  const formatMoney = (value) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(value);

  return (
    <PageTransition>
      <AdminLayout>
        <div className="dashboard-simple">
          <header className="dashboard-header">
            <div>
              <h1>Panel de Control</h1>
              <p>Resumen operativo para hoy, {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
            </div>
            <Link to="/admin/turnos" className="btn-primary-admin">
              <Plus size={18} /> Nuevo Turno
            </Link>
          </header>

          <section className="dashboard-stats">
            <div className="dash-stat-card">
              <div className="stat-icon blue"><Calendar size={22} /></div>
              <div className="stat-info">
                <span className="stat-label">Turnos hoy</span>
                <span className="stat-value">{isLoading ? "..." : stats.todayTurns}</span>
              </div>
            </div>
            
            <div className="dash-stat-card">
              <div className="stat-icon green"><TrendingUp size={22} /></div>
              <div className="stat-info">
                <span className="stat-label">Ingresos hoy</span>
                <span className="stat-value">{formatMoney(stats.income)}</span>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="stat-icon purple"><Users size={22} /></div>
              <div className="stat-info">
                <span className="stat-label">Clientes</span>
                <span className="stat-value">{stats.clients}</span>
              </div>
            </div>
          </section>

          <section className="dashboard-main-content">
            <div className="content-box">
              <div className="box-header">
                <div className="box-title">
                  <Clock size={18} />
                  <h2>Próximos Turnos</h2>
                </div>
                <Link to="/admin/turnos" className="box-link">
                  Ver agenda completa <ArrowRight size={14} />
                </Link>
              </div>

              {isLoading ? (
                <TurnsTableSkeleton />
              ) : todaysTurns.length > 0 ? (
                <TurnsTable
                  turns={todaysTurns.slice(0, 5)}
                  onStatusChange={updateTurnStatus}
                  onDeleteTurn={deleteTurn}
                />
              ) : (
                <div className="empty-state-simple">
                  <p>No hay turnos agendados para hoy.</p>
                </div>
              )}
            </div>

            <div className="dashboard-sidebar-content">
              <div className="content-box">
                <div className="box-header">
                  <h2>Acciones Rápidas</h2>
                </div>
                <div className="quick-actions-grid">
                  <Link to="/admin/clientes" className="quick-action-btn">
                    <Users size={18} /> Registrar Cliente
                  </Link>
                  <Link to="/admin/caja" className="quick-action-btn">
                    <Wallet size={18} /> Nuevo Movimiento
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default Dashboard;
