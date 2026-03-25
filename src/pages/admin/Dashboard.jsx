import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/ui/StatCard";
import SectionCard from "../../components/ui/SectionCard";

function Dashboard() {
  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Vista general del negocio, actividad reciente y próximos movimientos."
    >
      <section className="admin-stats-grid">
        <StatCard label="Turnos de hoy" value="0" />
        <StatCard label="Ingresos del día" value="$0" />
        <StatCard label="Consultas pendientes" value="0" />
      </section>

      <section className="admin-panels-grid">
        <SectionCard
          title="Próximos turnos"
          text="Más adelante vamos a traer esta información desde base de datos."
        />

        <SectionCard
          title="Resumen rápido"
          text="Este espacio se va a usar para caja, estados y actividad reciente."
        />
      </section>
    </AdminLayout>
  );
}

export default Dashboard;