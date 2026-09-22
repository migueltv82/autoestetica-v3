import { useCallback, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useServices } from "../../hooks/useServices";
import { useSettings } from "../../hooks/useSettings";
import { supabase } from "../../lib/supabase";
import { ORGANIZATION_SLUG } from "../../lib/organization";
import { Link } from "react-router-dom";
import "./InquiryForm.css";

const VEHICLE_OPTIONS = ["Auto", "Camioneta", "SUV", "Moto", "Bicicleta"];
const GENERIC_SUBMIT_ERROR = "No pudimos registrar la consulta. Intentá nuevamente.";

function getInquirySubmitErrorMessage(error) {
  const status = Number(error?.status ?? error?.context?.status ?? error?.context?.statusCode ?? error?.context?.response?.status);
  const errorText = `${error?.name || ""} ${error?.message || ""}`.toLowerCase();

  if (status === 503 || errorText.includes("503") || errorText.includes("service unavailable") || errorText.includes("servicio no disponible")) {
    return "El servicio de consultas no está disponible. Intentá más tarde o escribí por WhatsApp.";
  }

  if (status === 403 || error?.name === "FunctionsHttpError") {
    return "No se pudo enviar desde este dominio. Revisá PUBLIC_SITE_ORIGINS.";
  }

  if (error?.name === "FunctionsFetchError" || errorText.includes("fetch") || errorText.includes("network") || errorText.includes("red")) {
    return "Sin conexión. Revisá internet e intentá de nuevo.";
  }

  return GENERIC_SUBMIT_ERROR;
}

function InquiryForm() {
  const { services, isLoading: servicesLoading } = useServices();
  const { settings } = useSettings();
  const [formData, setFormData] = useState({ name: "", phone: "", vehicle: "", services: [], message: "", acceptedLegal: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedWhatsappUrl, setSubmittedWhatsappUrl] = useState("");
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const honeypotRef = useRef(null);
  const focusNameOnReset = useRef(false);
  const focusSuccess = useCallback((node) => node?.focus(), []);
  const availableServices = useMemo(() => services.map((service) => service.name), [services]);
  const noServicesAvailable = !servicesLoading && !availableServices.length;
  const configuredWhatsapp = useMemo(() => (settings.whatsapp || "").replace(/\D/g, ""), [settings.whatsapp]);
  const serviceFallbackWhatsappUrl = configuredWhatsapp ? `https://wa.me/${configuredWhatsapp}` : "";

  const missingFields = [
    !formData.name.trim() && "nombre y apellido",
    !formData.phone.trim() && "WhatsApp / teléfono",
    !formData.vehicle && "vehículo",
    !noServicesAvailable && !formData.services.length && "al menos un servicio",
  ].filter(Boolean);
  const validationMessage = missingFields.length
    ? `Completá los datos requeridos: ${new Intl.ListFormat("es").format(missingFields)}.`
    : !formData.acceptedLegal
      ? "Aceptá la Política de Privacidad y las Condiciones del Servicio para enviar tu consulta."
      : "";

  const whatsappText = useMemo(() => [
    "Hola, quiero hacer una consulta.", "",
    `*Nombre:* ${formData.name || "-"}`,
    `*Teléfono:* ${formData.phone || "-"}`,
    `*Vehículo:* ${formData.vehicle || "-"}`,
    `*Servicios:* ${formData.services.length ? formData.services.join(", ") : "-"}`,
    `*Consulta:* ${formData.message || "-"}`,
  ].join("\n"), [formData]);
  const errorWhatsappUrl = configuredWhatsapp ? `https://wa.me/${configuredWhatsapp}?text=${encodeURIComponent(whatsappText)}` : "";

  function selectVehicle(vehicle) { setFormData((current) => ({ ...current, vehicle, services: [] })); }
  function toggleService(service) {
    setFormData((current) => ({ ...current, services: current.services.includes(service) ? current.services.filter((item) => item !== service) : [...current.services, service] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitAttempted(true);
    if (validationMessage) return;
    if (noServicesAvailable) return;
    if (honeypotRef.current?.value) return;
    setIsSubmitting(true);
    setSubmitError("");
    let error;
    try {
      ({ error } = await supabase.functions.invoke("submit-public-inquiry", { body: {
        businessSlug: ORGANIZATION_SLUG,
        clientName: formData.name,
        clientPhone: formData.phone,
        vehicleType: formData.vehicle,
        requestedServices: formData.services,
        inquiryNotes: `${formData.message || "Consulta ingresada desde la web."}\nAceptó Política de Privacidad y Condiciones del Servicio (versión 2026-07-16).`,
      },
      }));
    } catch (caughtError) {
      error = caughtError;
    }
    setIsSubmitting(false);
    if (error) {
      console.error(error);
      setSubmitError(getInquirySubmitErrorMessage(error));
      return;
    }
    const whatsapp = configuredWhatsapp || "5493815448147";
    const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappText)}`;
    setSubmittedWhatsappUrl(whatsappUrl);
    const whatsappWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setWhatsappOpened(Boolean(whatsappWindow && !whatsappWindow.closed));
  }

  const invalid = submitAttempted && Boolean(validationMessage);
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
            <article className="inquiry-feature-card"><ShieldCheck size={18} /><div><strong>Datos protegidos</strong><span>Usamos tus datos únicamente para responder y coordinar el servicio.</span></div></article>
          </div>
        </div>

        {submittedWhatsappUrl ? (
          <div className="inquiry-form-panel">
            <div className="inquiry-form-heading">
              <h2 tabIndex={-1} ref={focusSuccess}>Tu consulta quedó registrada</h2>
              <p>{whatsappOpened ? "Abrimos WhatsApp con el resumen de tu consulta. También podés volver a abrirlo desde acá." : "Podés continuar por WhatsApp. Si no se abrió, usá el botón para abrirlo con el resumen de tu consulta."}</p>
            </div>
            <div className="inquiry-submit-row">
              <a className="btn-primary inquiry-submit" href={submittedWhatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" />Abrir WhatsApp</a>
              <button type="button" className="option-card" onClick={() => {
                focusNameOnReset.current = true;
                setFormData({ name: "", phone: "", vehicle: "", services: [], message: "", acceptedLegal: false });
                setSubmitAttempted(false);
                setSubmitError("");
                setSubmittedWhatsappUrl("");
                setWhatsappOpened(false);
              }}>Enviar otra consulta</button>
            </div>
          </div>
        ) : <form className="inquiry-form-panel" onSubmit={handleSubmit} noValidate ref={(node) => {
          if (node && focusNameOnReset.current) {
            node.querySelector("#inquiry-name")?.focus();
            focusNameOnReset.current = false;
          }
        }}>
          <input ref={honeypotRef} className="inquiry-honeypot" type="text" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" />
          <div className="inquiry-form-heading"><span>Consulta rápida</span><strong>Completá los datos principales</strong><p>Los campos marcados son necesarios para poder asesorarte.</p></div>
          {invalid ? <div className="inquiry-error" role="alert"><AlertTriangle size={16} />{validationMessage}</div> : null}
          {submitError ? <div className="inquiry-error" role="alert"><AlertTriangle size={16} /><span>{submitError}{errorWhatsappUrl ? <> <a href={errorWhatsappUrl} target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a></> : null}</span></div> : null}
          <div className="inquiry-form-grid">
            <div className={`inquiry-form-group${submitAttempted && !formData.name.trim() ? " has-error" : ""}`}>
              <label htmlFor="inquiry-name">Nombre y apellido *</label><input id="inquiry-name" type="text" required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Ej: Miguel Torres" autoComplete="name" aria-invalid={submitAttempted && !formData.name.trim()} />
            </div>
            <div className={`inquiry-form-group${submitAttempted && !formData.phone.trim() ? " has-error" : ""}`}>
              <label htmlFor="inquiry-phone">WhatsApp / Teléfono *</label><input id="inquiry-phone" type="tel" inputMode="tel" required value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} placeholder="Código de área + número" autoComplete="tel" aria-invalid={submitAttempted && !formData.phone.trim()} />
            </div>
          </div>
          <div className={`inquiry-form-group${submitAttempted && !formData.vehicle ? " has-error" : ""}`}>
            <label>Vehículo *</label><div className="options-grid">{VEHICLE_OPTIONS.map((vehicle) => <button key={vehicle} type="button" className={`option-card ${formData.vehicle === vehicle ? "selected" : ""}`} onClick={() => selectVehicle(vehicle)} aria-pressed={formData.vehicle === vehicle}><span>{vehicle}</span>{formData.vehicle === vehicle ? <Check size={16} /> : null}</button>)}</div>
          </div>
          <div className={`inquiry-form-group${submitAttempted && !noServicesAvailable && !formData.services.length ? " has-error" : ""}`}>
            <label>Servicios que te interesan{noServicesAvailable ? "" : " *"}</label>
            <div className="options-grid options-grid-services">
              {servicesLoading ? <span>Cargando servicios…</span> : availableServices.map((service) => <button key={service} type="button" className={`option-card option-card-service ${formData.services.includes(service) ? "selected" : ""}`} onClick={() => toggleService(service)} aria-pressed={formData.services.includes(service)}><span>{service}</span>{formData.services.includes(service) ? <Check size={16} /> : null}</button>)}
            </div>
            <div role="status" aria-atomic="true">
              {noServicesAvailable ? <div className="inquiry-error"><AlertTriangle size={16} /><span>No hay servicios publicados. Escribinos por {serviceFallbackWhatsappUrl ? <a href={serviceFallbackWhatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp (se abre en una nueva pestaña)</a> : "WhatsApp"} o desde <Link to="/contacto">contacto</Link>.</span></div> : null}
            </div>
          </div>
          <div className="inquiry-form-group"><label htmlFor="inquiry-message">Detalle adicional</label><textarea id="inquiry-message" rows="5" value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} placeholder="Contanos el estado del vehículo o el resultado que buscás." /></div>
          <label className={`inquiry-legal-consent${submitAttempted && !formData.acceptedLegal ? " has-error" : ""}`}><input type="checkbox" required checked={formData.acceptedLegal} aria-invalid={submitAttempted && !formData.acceptedLegal} onChange={(event) => setFormData({ ...formData, acceptedLegal: event.target.checked })} /><span>Acepto la <Link to="/privacidad" target="_blank" rel="noreferrer">Política de Privacidad</Link> y las <Link to="/terminos" target="_blank" rel="noreferrer">Condiciones del Servicio</Link>.</span></label>
          <div className="inquiry-submit-row"><p className="inquiry-submit-note">Al enviar, registramos la consulta y abrimos WhatsApp con el resumen listo.</p><button type="submit" className="btn-primary inquiry-submit" disabled={isSubmitting || servicesLoading || noServicesAvailable}><MessageCircle size={18} />{isSubmitting ? "Enviando…" : "Enviar consulta"}</button></div>
        </form>}
      </div>
    </section>
  );
}

export default InquiryForm;
