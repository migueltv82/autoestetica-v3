import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import { Save, Store, Shield, Smartphone, Mail, MapPin, Phone, Bell, History } from "lucide-react";

function Settings() {
  return (
    <PageTransition>
      <AdminLayout
        title="Configuración del Sistema"
        subtitle="Personalizá los parámetros generales de tu negocio, seguridad y notificaciones."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2.5rem" }}>
          
          {/* Business Info */}
          <section className="dashboard-panel">
            <header style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
              <div style={{ padding: "0.75rem", background: "rgba(0, 191, 166, 0.1)", borderRadius: "12px", color: "var(--color-primary)" }}>
                <Store size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Perfil del Negocio</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-soft)" }}>Información pública y de contacto.</p>
              </div>
            </header>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="admin-form-group">
                <label><Store size={14} /> Nombre Comercial</label>
                <input type="text" className="admin-input" defaultValue="Auto Estética V3" />
              </div>
              <div className="admin-form-group">
                <label><MapPin size={14} /> Dirección de Local</label>
                <input type="text" className="admin-input" defaultValue="Av. Alem 1234, Tucumán" />
              </div>
              <div className="admin-form-group">
                <label><Phone size={14} /> Teléfono Público</label>
                <input type="text" className="admin-input" defaultValue="381-4400000" />
              </div>
              <button className="btn-premium" style={{ marginTop: "1rem", alignSelf: "flex-start", minWidth: "180px", justifyContent: "center" }}>
                <Save size={18} /> Guardar Cambios
              </button>
            </div>
          </section>

          {/* WhatsApp Integration */}
          <section className="dashboard-panel">
            <header style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
              <div style={{ padding: "0.75rem", background: "rgba(0, 191, 166, 0.1)", borderRadius: "12px", color: "var(--color-primary)" }}>
                <Smartphone size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Integración WhatsApp</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-soft)" }}>Gestión de mensajes y recordatorios.</p>
              </div>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <p style={{ color: "var(--color-text-soft)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                Configurá el número que recibirá las notificaciones automáticas de nuevos turnos y consultas de clientes.
              </p>
              <div className="admin-form-group">
                <label><Smartphone size={14} /> WhatsApp Business</label>
                <input type="text" className="admin-input" defaultValue="+54 9 381 4400000" />
              </div>
              <div className="admin-form-group">
                <label style={{ display: "flex", alignItems: "center", gap: "0.85rem", cursor: "pointer", background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
                  <input type="checkbox" defaultChecked style={{ width: "18px", height: "18px", accentColor: "var(--color-primary)" }} />
                  <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>Notificar nuevos turnos al instante</span>
                </label>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="dashboard-panel">
            <header style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
              <div style={{ padding: "0.75rem", background: "rgba(248, 113, 113, 0.1)", borderRadius: "12px", color: "#f87171" }}>
                <Shield size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Seguridad y Acceso</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-soft)" }}>Gestión de credenciales administrativas.</p>
              </div>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="admin-form-group">
                <label><Mail size={14} /> Email del Administrador</label>
                <input type="email" className="admin-input" defaultValue="admin@autoestetica.com" />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>Actualizar Email</button>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: "center", border: "1px solid #f87171", color: "#f87171" }}>Cambiar Password</button>
              </div>
            </div>
          </section>

          {/* App Status */}
          <section className="dashboard-panel">
            <header style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
              <div style={{ padding: "0.75rem", background: "rgba(0, 191, 166, 0.1)", borderRadius: "12px", color: "var(--color-primary)" }}>
                <Bell size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Estado del Sistema</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-soft)" }}>Versión y logs de actividad.</p>
              </div>
            </header>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
               <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
                  <span style={{ color: "var(--color-text-soft)", fontSize: "0.95rem" }}>Versión de Software</span>
                  <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>v3.4.2-stable</span>
               </div>
               <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
                  <span style={{ color: "var(--color-text-soft)", fontSize: "0.95rem" }}>Último Respaldo</span>
                  <span style={{ fontWeight: 600 }}>Hoy, 04:00 AM</span>
               </div>
               <button className="btn-ghost" style={{ marginTop: "0.5rem", justifyContent: "center" }}>
                 <History size={16} /> Ver historial de cambios
               </button>
            </div>
          </section>

        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default Settings;