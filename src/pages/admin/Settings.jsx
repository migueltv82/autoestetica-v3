import { useMemo, useState } from "react";
import { Check, Clock3, Image, Mail, MapPin, MessageCircle, Phone, ReceiptText, Save, Store } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import Loader from "../../components/ui/Loader";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "../../components/ui/SocialIcons";
import { useSettings } from "../../hooks/useSettings";
import "./Settings.css";

function SettingsSection({ icon, title, text, badge, children }) {
  return <section className="settings-section"><header><span className="settings-section-icon">{icon}</span><div><div className="settings-title-line"><h2>{title}</h2>{badge ? <small>{badge}</small> : null}</div><p>{text}</p></div></header><div className="settings-fields">{children}</div></section>;
}

function Field({ label, hint, children, full = false }) {
  return <div className={`settings-field${full ? " full" : ""}`}><label>{label}</label>{children}{hint ? <small>{hint}</small> : null}</div>;
}

function SettingsForm({ initialSettings, onSave }) {
  const [form, setForm] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");
  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initialSettings), [form, initialSettings]);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    if (!form.businessName.trim() || !form.whatsapp.trim()) { setError("El nombre del negocio y WhatsApp son obligatorios."); return; }
    setIsSaving(true); setError("");
    try { await onSave(form); setIsSaved(true); setTimeout(() => setIsSaved(false), 2500); }
    catch (saveError) { setError(saveError.message || "No se pudieron guardar los cambios."); }
    finally { setIsSaving(false); }
  }

  return <form onSubmit={submit} className="settings-form">
    <div className="settings-layout">
      <div className="settings-main">
        <SettingsSection icon={<Store size={20} />} title="Identidad del negocio" text="Nombre, ubicación y horarios que ven tus clientes." badge="Sitio y footer">
          <Field label="Nombre del negocio"><input name="businessName" value={form.businessName} onChange={change} required /></Field>
          <Field label="Dirección"><div className="settings-input-icon"><MapPin size={15} /><input name="address" value={form.address} onChange={change} placeholder="Tucumán, Argentina" /></div></Field>
          <Field label="Horarios" full><div className="settings-input-icon"><Clock3 size={15} /><input name="openingHours" value={form.openingHours} onChange={change} placeholder="Lunes a viernes de 9:00 a 18:00" /></div></Field>
          <Field label="URL del logo" hint="Se usa en el encabezado, footer y recibos." full><div className="settings-input-icon"><Image size={15} /><input type="url" name="logoUrl" value={form.logoUrl} onChange={change} placeholder="https://…" /></div></Field>
        </SettingsSection>

        <SettingsSection icon={<Phone size={20} />} title="Contacto y redes" text="Dejá vacío cualquier canal que no quieras mostrar." badge="Sitio público">
          <Field label="WhatsApp"><div className="settings-input-icon"><MessageCircle size={15} /><input type="tel" inputMode="tel" name="whatsapp" value={form.whatsapp} onChange={change} required placeholder="+54 9 381…" /></div></Field>
          <Field label="Teléfono público"><div className="settings-input-icon"><Phone size={15} /><input type="tel" inputMode="tel" name="phone" value={form.phone} onChange={change} /></div></Field>
          <Field label="Email" full><div className="settings-input-icon"><Mail size={15} /><input type="email" name="email" value={form.email} onChange={change} /></div></Field>
          <Field label="Instagram"><div className="settings-input-icon"><InstagramIcon size={15} /><input type="url" name="instagram" value={form.instagram} onChange={change} placeholder="https://instagram.com/…" /></div></Field>
          <Field label="Facebook"><div className="settings-input-icon"><FacebookIcon size={15} /><input type="url" name="facebook" value={form.facebook} onChange={change} placeholder="https://facebook.com/…" /></div></Field>
          <Field label="TikTok" full><div className="settings-input-icon"><TikTokIcon size={15} /><input type="url" name="tiktok" value={form.tiktok} onChange={change} placeholder="https://tiktok.com/@…" /></div></Field>
        </SettingsSection>

        <SettingsSection icon={<MessageCircle size={20} />} title="Mensajes de WhatsApp" text="Plantillas usadas desde la Agenda y la ficha de clientes." badge="WhatsApp">
          <Field label="Confirmación de turno" hint="Variables: {cliente}, {negocio}, {fecha}, {hora}, {vehiculo} y {servicios}." full><textarea name="confirmationMessageTemplate" rows="5" value={form.confirmationMessageTemplate} onChange={change} /></Field>
          <Field label="Aviso de vehículo listo" hint="Variables disponibles: {cliente}, {vehiculo} y {horario}." full><textarea name="readyMessageTemplate" rows="5" value={form.readyMessageTemplate} onChange={change} /></Field>
        </SettingsSection>

        <SettingsSection icon={<ReceiptText size={20} />} title="Recibos" text="Texto final que acompaña cada comprobante generado." badge="Caja">
          <Field label="Pie del recibo" full><textarea name="receiptFooter" rows="3" value={form.receiptFooter} onChange={change} placeholder="Gracias por confiar en nuestro trabajo." /></Field>
        </SettingsSection>
      </div>

    </div>

    <div className="settings-save-bar"><div>{error ? <span className="settings-error">{error}</span> : isDirty ? <span>Tenés cambios sin guardar.</span> : <span>La configuración está actualizada.</span>}</div><button type="submit" className={`btn-premium settings-save-btn ${isSaved ? "success" : ""}`} disabled={isSaving || !isDirty}>{isSaved ? <Check size={18} /> : <Save size={18} />}<span>{isSaving ? "Guardando…" : isSaved ? "Cambios guardados" : "Guardar cambios"}</span></button></div>
  </form>;
}

function Settings() {
  const { settings, updateSettings, isLoading, error } = useSettings();
  return <PageTransition><AdminLayout title="Configuración" subtitle="Identidad, contacto, mensajes y recibos del negocio.">{isLoading ? <Loader /> : error ? <div className="settings-load-error">No pudimos cargar la configuración.</div> : <SettingsForm key={JSON.stringify(settings)} initialSettings={settings} onSave={updateSettings} />}</AdminLayout></PageTransition>;
}
export default Settings;
