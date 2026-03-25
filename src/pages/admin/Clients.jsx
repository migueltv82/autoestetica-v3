import AdminLayout from "../../components/admin/AdminLayout";

function Clients() {
  return (
    <AdminLayout
      title="Clientes"
      subtitle="Historial, datos y seguimiento de clientes del negocio."
    >
      <div style={panelStyle}>Acá vamos a construir el módulo de clientes.</div>
    </AdminLayout>
  );
}

const panelStyle = {
  padding: "1.4rem",
  borderRadius: "24px",
  border: "1px solid var(--color-border)",
  background: "linear-gradient(180deg, rgba(24,29,39,0.92), rgba(14,17,24,0.98))",
};

export default Clients;