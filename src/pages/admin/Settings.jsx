import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import { Save, Store, Shield, Smartphone, Mail, MapPin, Phone, Bell, History, Check } from "lucide-react";
import "./Settings.css";

function Settings() {
  return (
    <PageTransition>
      <AdminLayout
        title="Configuracion del Sistema"
        subtitle="Ajusta datos del negocio, acceso administrativo y notificaciones desde una sola pantalla."
      >
        <div className="settings-grid">
          <section className="dashboard-panel">
            <header className="settings-header">
              <div className="settings-icon-box">
                <Store size={24} />
              </div>
              <div className="settings-title-group">
                <h3>Perfil del negocio</h3>
                <p>Informacion publica y de contacto.</p>
              </div>
            </header>

            <div className="settings-body">
              <div className="admin-form-group">
                <label>
                  <Store size={14} /> Nombre comercial
                </label>
                <input type="text" className="admin-input" defaultValue="Auto Estetica V3" />
              </div>
              <div className="admin-form-group">
                <label>
                  <MapPin size={14} /> Direccion del local
                </label>
                <input type="text" className="admin-input" defaultValue="Av. Alem 1234, Tucuman" />
              </div>
              <div className="admin-form-group">
                <label>
                  <Phone size={14} /> Telefono publico
                </label>
                <input type="text" className="admin-input" defaultValue="381-4400000" />
              </div>
              <button className="btn-premium settings-save-btn">
                <Save size={18} /> <span>Guardar cambios</span>
              </button>
            </div>
          </section>

          <section className="dashboard-panel">
            <header className="settings-header">
              <div className="settings-icon-box">
                <Smartphone size={24} />
              </div>
              <div className="settings-title-group">
                <h3>Integracion WhatsApp</h3>
                <p>Mensajes, alertas y seguimiento.</p>
              </div>
            </header>

            <div className="settings-body">
              <p className="settings-info-text">
                Configura el numero que recibira las notificaciones automaticas de nuevos turnos y consultas.
              </p>
              <div className="admin-form-group">
                <label>
                  <Smartphone size={14} /> WhatsApp business
                </label>
                <input type="text" className="admin-input" defaultValue="+54 9 381 4400000" />
              </div>
              <label className="settings-checkbox-label">
                <input type="checkbox" defaultChecked className="settings-checkbox" />
                <span className="settings-checkbox-text">Notificar nuevos turnos al instante</span>
              </label>
            </div>
          </section>

          <section className="dashboard-panel">
            <header className="settings-header">
              <div className="settings-icon-box danger">
                <Shield size={24} />
              </div>
              <div className="settings-title-group">
                <h3>Seguridad y acceso</h3>
                <p>Gestion de credenciales administrativas.</p>
              </div>
            </header>

            <div className="settings-body">
              <div className="admin-form-group">
                <label>
                  <Mail size={14} /> Email del administrador
                </label>
                <input type="email" className="admin-input" defaultValue="admin@autoestetica.com" />
              </div>
              <div className="settings-action-row">
                <button className="btn-ghost settings-secondary-btn">Actualizar email</button>
                <button className="btn-ghost settings-danger-btn">Cambiar password</button>
              </div>
            </div>
          </section>

          <section className="dashboard-panel">
            <header className="settings-header">
              <div className="settings-icon-box">
                <Bell size={24} />
              </div>
              <div className="settings-title-group">
                <h3>Estado del sistema</h3>
                <p>Version y actividad reciente.</p>
              </div>
            </header>

            <div className="settings-body">
              <div className="settings-status-row">
                <span className="settings-status-label">Version de software</span>
                <span className="settings-status-value primary">v3.4.2-stable</span>
              </div>
              <div className="settings-status-row">
                <span className="settings-status-label">Ultimo respaldo</span>
                <span className="settings-status-value">
                  <Check size={14} className="settings-status-icon" />
                  Hoy, 04:00 AM
                </span>
              </div>
              <button className="btn-ghost settings-history-btn">
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
