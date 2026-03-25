import AdminLayout from "../../components/admin/AdminLayout";

function AdminServices() {
  return (
    <AdminLayout
      title="Servicios"
      subtitle="Administración interna de servicios, duración y valores."
    >
      <div style={panelStyle}>Acá vamos a construir el módulo de servicios.</div>
    </AdminLayout>
  );
}

const panelStyle = {
  padding: "1.4rem",
  borderRadius: "24px",
  border: "1px solid var(--color-border)",
  background: "linear-gradient(180deg, rgba(24,29,39,0.92), rgba(14,17,24,0.98))",
};

export default AdminServices;