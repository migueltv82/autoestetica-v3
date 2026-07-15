import { useMemo, useState } from "react";
import { AlertTriangle, Check, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useServices } from "../../hooks/useServices";
import { useSettings } from "../../hooks/useSettings";
import { supabase } from "../../lib/supabase";
import { ORGANIZATION_SLUG } from "../../lib/organization";
import "./InquiryForm.css";

const VEHICLE_OPTIONS = ["Auto", "Camioneta", "SUV", "Moto", "Bicicleta"];

function InquiryForm() {
  const { services, isLoading: servicesLoading } = useServices();
  const { settings } = useSettings();
  const [formData, setFormData] = useState({ name: "", phone: "", vehicle: "", services: [], message: "" });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const availableServices = useMemo(() => services.map((service) => service.name), [services]);
  const whatsappText = useMemo(() => [
    "Hola, quiero hacer una consulta.", "",
    `*Nombre:* ${formData.name || "-"}`,
    `*Teléfono:* ${formData.phone || "-"}`,
    `*Vehículo:* ${formData.vehicle || "-"}`,
    `*Servicios:* ${formData.services.length ? formData.services.join(", ") : "-"}`,
    `*Consulta:* ${formData.message || "-"}`,
  ].join("\n"), [formData]);

  function selectVehicle(vehicle) { setFormData((current) => ({ ...current, vehicle, services: [] })); }
  function toggleService(service) {
    setFormData((current) => ({ ...current, services: current.services.includes(service) ? current.services.filter((item) => item !== service) : [...current.services, service] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!formData.name.trim() || !formData.phone.trim() || !formData.vehicle || !formData.services.length) return;
    setIsSubmitting(true);
    setSubmitError("");
    const { error } = await supabase.rpc("submit_inquiry", {
      business_slug: ORGANIZATION_SLUG,
      client_name: formData.name,
      client_phone: formData.phone,
      vehicle_type: formData.vehicle,
      requested_services: formData.services,
      inquiry_notes: formData.message || "Consulta ingresada desde la web.",
    });
    setIsSubmitting(false);
    if (error) {
      console.error(error);
      setSubmitError("No pudimos registrar la consulta. Intentá nuevamente.");
      return;
    }
    const whatsapp = (settings.whatsapp || "5493815448147").replace(/\D/g, "");
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappText)}`, "_blank", "noopener,noreferrer");
    setFormData({ name: "", phone: "", vehicle: "", services: [], message: "" });
    setSubmitAttempted(false);
  }

  const invalid = submitAttempted && (!formData.name.trim() || !formData.phone.trim() || !formData.vehicle || !formData.services.length);
  return (
    <section className="section inquiry-page">
      <div className="container inquiry-shell">
        <div className="inquiry-intro">
          <span className="section-kicker">Consulta personalizada</span>
          <h1 className="section-title">Contanos qué necesita <span className="inquiry-title-accent">tu vehículo</span>.</h1>
          <p className="section-text">Completá los datos principales y preparamos tu consulta para responderte con contexto.</p>
          <div className="inquiry-feature-list">
            <article className="inquiry-feature-card"><Sparkles size={18} /><div><strong>Asesoría clara</strong><span>Te orientamos según el estado y el uso real del vehículo.</span></div></article>
            <article className="inquiry-feature-card"><MessageCircle size={18} /><div><strong>Respuesta directa</strong><span>La consulta queda lista para continuar por WhatsApp.</span></div></article>
            <article className="inquiry-feature-card"><ShieldCheck size={18} /><div><strong>Seguimiento interno</strong><span>También queda registrada en el panel administrativo.</span></div></article>
          </div>
        </div>

        <form className="inquiry-form-panel" onSubmit={handleSubmit}>
          {invalid ? <div className="inquiry-error" role="alert"><AlertTriangle size={16} />Completá nombre, teléfono, vehículo y al menos un servicio.</div> : null}
          {submitError ? <div className="inquiry-error" role="alert"><AlertTriangle size={16} />{submitError}</div> : null}
          <div className="inquiry-form-grid">
            <div className={`inquiry-form-group${submitAttempted && !formData.name.trim() ? " has-error" : ""}`}>
              <label>Nombre y apellido</label><input type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Ej: Miguel Torres" autoComplete="name" />
            </div>
            <div className={`inquiry-form-group${submitAttempted && !formData.phone.trim() ? " has-error" : ""}`}>
              <label>WhatsApp / Teléfono</label><input type="tel" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} placeholder="Código de área + número" autoComplete="tel" />
            </div>
          </div>
          <div className={`inquiry-form-group${submitAttempted && !formData.vehicle ? " has-error" : ""}`}>
            <label>Vehículo</label><div className="options-grid">{VEHICLE_OPTIONS.map((vehicle) => <button key={vehicle} type="button" className={`option-card ${formData.vehicle === vehicle ? "selected" : ""}`} onClick={() => selectVehicle(vehicle)}><span>{vehicle}</span>{formData.vehicle === vehicle ? <Check size={16} /> : null}</button>)}</div>
          </div>
          <div className={`inquiry-form-group${submitAttempted && !formData.services.length ? " has-error" : ""}`}>
            <label>Servicios que te interesan</label>
            <div className="options-grid options-grid-services">
              {servicesLoading ? <span>Cargando servicios…</span> : availableServices.map((service) => <button key={service} type="button" className={`option-card option-card-service ${formData.services.includes(service) ? "selected" : ""}`} onClick={() => toggleService(service)}><span>{service}</span>{formData.services.includes(service) ? <Check size={16} /> : null}</button>)}
            </div>
          </div>
          <div className="inquiry-form-group"><label>Detalle adicional</label><textarea rows="5" value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} placeholder="Contanos el estado del vehículo o el resultado que buscás." /></div>
          <div className="inquiry-submit-row"><p className="inquiry-submit-note">La consulta se guarda en el panel y luego abrimos WhatsApp.</p><button type="submit" className="btn-primary inquiry-submit" disabled={isSubmitting || servicesLoading}><MessageCircle size={18} />{isSubmitting ? "Registrando…" : "Enviar consulta"}</button></div>
        </form>
      </div>
    </section>
  );
}

export default InquiryForm;
