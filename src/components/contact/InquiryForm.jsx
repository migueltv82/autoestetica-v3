import { useMemo, useState } from "react";
import "./InquiryForm.css";

const VEHICLE_OPTIONS = ["Auto", "Camioneta", "SUV", "Moto", "Bicicleta"];

const SERVICE_OPTIONS = [
  "Lavado premium",
  "Limpieza de interior",
  "Pulido y abrillantado",
  "Lavado de motor",
  "Lavado y detallado de motos",
  "Lavado y detallado de bicicletas",
];

const WHATSAPP_NUMBER = "5493815448147";

function InquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicle: "Auto",
    service: "",
    message: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const whatsappUrl = useMemo(() => {
    const text = [
      "Hola, quiero hacer una consulta.",
      "",
      `Nombre: ${formData.name || "-"}`,
      `Teléfono: ${formData.phone || "-"}`,
      `Vehículo: ${formData.vehicle || "-"}`,
      `Servicio de interés: ${formData.service || "-"}`,
      `Consulta: ${formData.message || "-"}`,
    ].join("\n");

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }, [formData]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert("Ingresá tu nombre.");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Ingresá tu teléfono.");
      return;
    }

    if (!formData.service.trim()) {
      alert("Seleccioná un servicio.");
      return;
    }

    window.open(whatsappUrl, "_blank");
  }

  return (
    <section className="section">
      <div className="container inquiry-grid">
        <div>
          <span className="section-kicker">Consulta</span>
          <h1 className="section-title">Contanos qué necesitás</h1>
          <p className="section-text">
            Completá este formulario y se abrirá WhatsApp con el mensaje ya armado
            para que podamos responderte de manera más rápida y ordenada.
          </p>

          <div className="inquiry-info-card">
            <strong>Importante</strong>
            <p>
              Los turnos no se reservan automáticamente desde la web. La coordinación
              se realiza de forma personalizada por WhatsApp.
            </p>
          </div>
        </div>

        <form className="inquiry-form" onSubmit={handleSubmit}>
          <div className="inquiry-form-group">
            <label>Nombre y apellido</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Miguel Torres"
            />
          </div>

          <div className="inquiry-form-group">
            <label>WhatsApp / Teléfono</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="381..."
            />
          </div>

          <div className="inquiry-form-group">
            <label>Vehículo</label>
            <select name="vehicle" value={formData.vehicle} onChange={handleChange}>
              {VEHICLE_OPTIONS.map((vehicle) => (
                <option key={vehicle} value={vehicle}>
                  {vehicle}
                </option>
              ))}
            </select>
          </div>

          <div className="inquiry-form-group">
            <label>Servicio de interés</label>
            <select name="service" value={formData.service} onChange={handleChange}>
              <option value="">Seleccioná un servicio</option>
              {SERVICE_OPTIONS.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          <div className="inquiry-form-group">
            <label>Mensaje</label>
            <textarea
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              placeholder="Escribí tu consulta o aclaración"
            />
          </div>

          <button type="submit" className="btn-primary inquiry-submit">
            Enviar consulta por WhatsApp
          </button>
        </form>
      </div>
    </section>
  );
}

export default InquiryForm;