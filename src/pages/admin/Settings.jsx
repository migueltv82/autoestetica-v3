import { useState } from "react";
import { Check, Clock, MapPin, Save, Smartphone, Store } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import Loader from "../../components/ui/Loader";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "../../components/ui/SocialIcons";
import { useSettings } from "../../hooks/useSettings";
import "./Settings.css";

function SettingsForm({ initialSettings, onSave }) {
  const [form, setForm] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setIsSaving(true); setError("");
    try {
      await onSave(form);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch { setError("No se pudieron guardar los cambios."); }
    setIsSaving(false);
  }

  return (
    <form onSubmit={submit} className="settings-grid">
      <section className="dashboard-panel">
        <header className="settings-header"><div className="settings-icon-box"><Store size={21} /></div><div className="settings-title-group"><h3>Datos del negocio</h3><p>Se usan en el sitio y en los recibos.</p></div></header>
        <div className="settings-body">
          <div className="admin-form-group"><label><Store size={14} /> Nombre</label><input name="businessName" value={form.businessName} onChange={change} /></div>
          <div className="admin-form-group"><label><MapPin size={14} /> Dirección</label><input name="address" value={form.address} onChange={change} /></div>
          <div className="admin-form-group"><label><Clock size={14} /> Horarios</label><input name="openingHours" value={form.openingHours} onChange={change} /></div>
          <div className="admin-form-group"><label><Smartphone size={14} /> WhatsApp</label><input name="whatsapp" value={form.whatsapp} onChange={change} /></div>
        </div>
      </section>
      <section className="dashboard-panel">
        <header className="settings-header"><div className="settings-icon-box"><Smartphone size={21} /></div><div className="settings-title-group"><h3>Contacto y redes</h3><p>Dejá vacío lo que no quieras mostrar.</p></div></header>
        <div className="settings-body">
          <div className="admin-form-group"><label>Email público</label><input type="email" name="email" value={form.email} onChange={change} /></div>
          <div className="admin-form-group"><label>Telefono publico</label><input type="tel" name="phone" value={form.phone} onChange={change} placeholder="381 555 0000" /></div>
          <div className="admin-form-group"><label><InstagramIcon size={14} /> Instagram</label><input name="instagram" value={form.instagram} onChange={change} placeholder="https://instagram.com/..." /></div>
          <div className="admin-form-group"><label><FacebookIcon size={14} /> Facebook</label><input name="facebook" value={form.facebook} onChange={change} placeholder="https://facebook.com/..." /></div>
          <div className="admin-form-group"><label><TikTokIcon size={14} /> TikTok</label><input name="tiktok" value={form.tiktok} onChange={change} placeholder="https://tiktok.com/@..." /></div>
        </div>
      </section>
      <div className="settings-global-actions">
        {error ? <span className="settings-error">{error}</span> : null}
        <button type="submit" className={`btn-premium settings-save-btn ${isSaved ? "success" : ""}`} disabled={isSaving}>{isSaved ? <Check size={18} /> : <Save size={18} />}<span>{isSaving ? "Guardando…" : isSaved ? "Cambios guardados" : "Guardar cambios"}</span></button>
      </div>
    </form>
  );
}

function Settings() {
  const { settings, updateSettings, isLoading } = useSettings();
  return (
    <PageTransition><AdminLayout>{isLoading ? <Loader /> : <><div className="admin-page-header"><div><span className="admin-page-header-kicker">Ajustes</span><h1 className="admin-page-header-title">Información del negocio</h1><p className="admin-page-header-text">Mantené actualizados los datos que ven tus clientes.</p></div></div><SettingsForm key={JSON.stringify(settings)} initialSettings={settings} onSave={updateSettings} /></>}</AdminLayout></PageTransition>
  );
}

export default Settings;
