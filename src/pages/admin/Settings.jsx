import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import { Save, Store, Shield, Smartphone, Mail, MapPin, Phone, Bell, History, Check } from "lucide-react";
import "./Settings.css";

function Settings() {
  return (
    <PageTransition>
      <AdminLayout
        title="Configuración del Sistema"
        subtitle="Personalizá los parámetros generales de tu negocio, seguridad y notificaciones."
      >
        <div className="settings-grid">
          
          {/* Business Info */}
          <section className="dashboard-panel">
            <header className="settings-header">
              <div className="settings-icon-box">
                <Store size={24} />
              </div>
              <div className="settings-title-group">
                <h3>Perfil del Negocio</h3>
                <p>Información pública y de contacto.</p>
              </div>
            </header>
            
            <div className="settings-body">
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label><Store size={14} /> NOMBRE COMERCIAL</label>
                <input type="text" className="admin-input" defaultValue="Auto Estética V3" />
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label><MapPin size={14} /> DIRECCIÓN DE LOCAL</label>
                <input type="text" className="admin-input" defaultValue="Av. Alem 1234, Tucumán" />
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label><Phone size={14} /> TELÉFONO PÚBLICO</label>
                <input type="text" className="admin-input" defaultValue="381-4400000" />
              </div>
              <button className="btn-premium" style={{ marginTop: "1rem", alignSelf: "flex-start", minWidth: "200px", justifyContent: "center" }}>
                <Save size={18} /> <span>Guardar Cambios</span>
              </button>
            </div>
          </section>

          {/* WhatsApp Integration */}
          <section className="dashboard-panel">
            <header className="settings-header">
              <div className="settings-icon-box">
                <Smartphone size={24} />
              </div>
              <div className="settings-title-group">
                <h3>Integración WhatsApp</h3>
                <p>Gestión de mensajes y recordatorios.</p>
              </div>
            </header>

            <div className="settings-body">
              <p className="settings-info-text">
                Configurá el número que recibirá las notificaciones automáticas de nuevos turnos y consultas de clientes.
              </p>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label><Smartphone size={14} /> WHATSAPP BUSINESS</label>
                <input type="text" className="admin-input" defaultValue="+54 9 381 4400000" />
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="settings-checkbox-label">
                  <input type="checkbox" defaultChecked className="settings-checkbox" />
                  <span className="settings-checkbox-text">Notificar nuevos turnos al instante</span>
                </label>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="dashboard-panel">
            <header className="settings-header">
              <div className="settings-icon-box danger">
                <Shield size={24} />
              </div>
              <div className="settings-title-group">
                <h3>Seguridad y Acceso</h3>
                <p>Gestión de credenciales administrativas.</p>
              </div>
            </header>

            <div className="settings-body">
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label><Mail size={14} /> EMAIL DEL ADMINISTRADOR</label>
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
            <header className="settings-header">
              <div className="settings-icon-box">
                <Bell size={24} />
              </div>
              <div className="settings-title-group">
                <h3>Estado del Sistema</h3>
                <p>Versión y logs de actividad.</p>
              </div>
            </header>
            
            <div className="settings-body">
               <div className="settings-status-row">
                  <span className="settings-status-label">Versión de Software</span>
                  <span className="settings-status-value primary">v3.4.2-stable</span>
               </div>
               <div className="settings-status-row">
                  <span className="settings-status-label">Último Respaldo</span>
                  <span className="settings-status-value">
                    <Check size={14} style={{ color: "var(--color-primary)", marginRight: "6px" }} />
                    Hoy, 04:00 AM
                  </span>
               </div>
               <button className="btn-ghost" style={{ marginTop: "0.5rem", justifyContent: "center" }}>
                 <History size={16} /> <span>Ver historial de cambios</span>
               </button>
            </div>
          </section>

        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default Settings;