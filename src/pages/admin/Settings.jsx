import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import { Save, Store, Shield, Smartphone, Mail, MapPin, Bell, History, Check, Clock } from "lucide-react";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "../../components/ui/SocialIcons";
import { useSettings } from "../../hooks/useSettings";
import "./Settings.css";

function Settings() {
  const { settings, updateSettings } = useSettings();
  const [form, setForm] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <PageTransition>
      <AdminLayout
        title="Configuración del Sistema"
        subtitle="Ajusta datos del negocio, acceso administrativo y redes sociales."
      >
        <form onSubmit={handleSubmit} className="settings-grid">
          {/* PERFIL DEL NEGOCIO */}
          <section className="dashboard-panel">
            <header className="settings-header">
              <div className="settings-icon-box">
                <Store size={24} />
              </div>
              <div className="settings-title-group">
                <h3>Perfil del negocio</h3>
                <p>Información básica e identidad.</p>
              </div>
            </header>

            <div className="settings-body">
              <div className="admin-form-group">
                <label><Store size={14} /> Nombre comercial</label>
                <input 
                  type="text" 
                  name="businessName"
                  className="admin-input" 
                  value={form.businessName} 
                  onChange={handleChange}
                />
              </div>
              <div className="admin-form-group">
                <label><MapPin size={14} /> Dirección física</label>
                <input 
                  type="text" 
                  name="address"
                  className="admin-input" 
                  value={form.address} 
                  onChange={handleChange}
                />
              </div>
              <div className="admin-form-group">
                <label><Clock size={14} /> Horarios de atención</label>
                <input 
                  type="text" 
                  name="openingHours"
                  className="admin-input" 
                  value={form.openingHours} 
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* CONTACTO Y REDES */}
          <section className="dashboard-panel">
            <header className="settings-header">
              <div className="settings-icon-box">
                <Smartphone size={24} />
              </div>
              <div className="settings-title-group">
                <h3>Contacto y Redes</h3>
                <p>Canales de comunicación pública.</p>
              </div>
            </header>

            <div className="settings-body">
              <div className="admin-form-group">
                <label><Smartphone size={14} /> WhatsApp Business</label>
                <input 
                  type="text" 
                  name="whatsapp"
                  className="admin-input" 
                  value={form.whatsapp} 
                  onChange={handleChange}
                />
              </div>
              <div className="admin-form-group">
                <label><InstagramIcon size={14} /> Instagram (URL)</label>
                <input 
                  type="text" 
                  name="instagram"
                  className="admin-input" 
                  value={form.instagram} 
                  onChange={handleChange}
                  placeholder="https://instagram.com/tu_cuenta"
                />
              </div>
              <div className="admin-form-group">
                <label><FacebookIcon size={14} /> Facebook (URL)</label>
                <input 
                  type="text" 
                  name="facebook"
                  className="admin-input" 
                  value={form.facebook} 
                  onChange={handleChange}
                  placeholder="https://facebook.com/tu_pagina"
                />
              </div>
              <div className="admin-form-group">
                <label><TikTokIcon size={14} /> TikTok (URL)</label>
                <input 
                  type="text" 
                  name="tiktok"
                  className="admin-input" 
                  value={form.tiktok || ''} 
                  onChange={handleChange}
                  placeholder="https://tiktok.com/@tu_cuenta"
                />
              </div>
            </div>
          </section>

          {/* ACCIONES GLOBALES */}
          <div className="settings-global-actions">
            <button type="submit" className={`btn-premium settings-save-btn ${isSaved ? 'success' : ''}`}>
              {isSaved ? <Check size={18} /> : <Save size={18} />}
              <span>{isSaved ? "Cambios guardados" : "Guardar configuración global"}</span>
            </button>
          </div>

          {/* SEGURIDAD (Simulado) */}
          <section className="dashboard-panel">
            <header className="settings-header">
              <div className="settings-icon-box danger">
                <Shield size={24} />
              </div>
              <div className="settings-title-group">
                <h3>Seguridad</h3>
                <p>Gestión de credenciales.</p>
              </div>
            </header>

            <div className="settings-body">
              <div className="admin-form-group">
                <label><Mail size={14} /> Email del administrador</label>
                <input 
                  type="email" 
                  name="email"
                  className="admin-input" 
                  value={form.email} 
                  onChange={handleChange}
                />
              </div>
              <div className="settings-action-row">
                <button type="button" className="btn-ghost settings-secondary-btn">Actualizar email</button>
                <button type="button" className="btn-ghost settings-danger-btn">Cambiar password</button>
              </div>
            </div>
          </section>

          {/* ESTADO */}
          <section className="dashboard-panel">
            <header className="settings-header">
              <div className="settings-icon-box">
                <Bell size={24} />
              </div>
              <div className="settings-title-group">
                <h3>Sistema</h3>
                <p>Versión v3.4.2-stable</p>
              </div>
            </header>

            <div className="settings-body">
              <div className="settings-status-row">
                <span className="settings-status-label">Próximo Backup</span>
                <span className="settings-status-value">Mañana, 04:00 AM</span>
              </div>
              <button type="button" className="btn-ghost settings-history-btn">
                <History size={16} /> <span>Ver historial</span>
              </button>
            </div>
          </section>
        </form>
      </AdminLayout>
    </PageTransition>
  );
}

export default Settings;
