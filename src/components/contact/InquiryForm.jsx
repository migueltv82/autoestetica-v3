import { useMemo, useState } from "react";
import { Check, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { createDemoTurns } from "../../data/demoTurns";
import { getTodayString } from "../../utils/date";
import "./InquiryForm.css";

const VEHICLE_OPTIONS = ["Auto", "Camioneta", "SUV", "Moto", "Bicicleta"];
const WHATSAPP_NUMBER = "5493815448147";

function InquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicle: "",
    services: [],
    message: "",
  });

  const availableServices = useMemo(() => {
    if (formData.vehicle === "Moto") return ["Lavado y detallado de motos"];
    if (formData.vehicle === "Bicicleta") return ["Lavado y detallado de bicicletas"];

    return [
      "Lavado premium",
      "Limpieza y detallado interior",
      "Pulido y abrillantado",
      "Tratamiento acrilico / ceramico",
      "Limpieza de motor",
    ];
  }, [formData.vehicle]);

  const whatsappText = useMemo(() => {
    return [
      "Hola, quiero hacer una consulta.",
      "",
      `*Nombre:* ${formData.name || "-"}`,
      `*Telefono:* ${formData.phone || "-"}`,
      `*Vehiculo:* ${formData.vehicle || "-"}`,
      `*Servicios:* ${formData.services.length > 0 ? formData.services.join(", ") : "-"}`,
      `*Consulta:* ${formData.message || "-"}`,
    ].join("\n");
  }, [formData]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function selectVehicle(vehicle) {
    setFormData((prev) => ({ ...prev, vehicle, services: [] }));
  }

  function toggleService(service) {
    setFormData((prev) => {
      const current = prev.services;

      if (current.includes(service)) {
        return { ...prev, services: current.filter((item) => item !== service) };
      }

      return { ...prev, services: [...current, service] };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.vehicle || formData.services.length === 0) {
      return;
    }

    try {
      const existingTurns = JSON.parse(localStorage.getItem("turns") || "[]");
      const initialTurns = existingTurns.length > 0 ? existingTurns : createDemoTurns();

      const newLead = {
        id: Date.now(),
        date: getTodayString(),
        time: "---",
        client: formData.name,
        phone: formData.phone,
        vehicle: formData.vehicle,
        service: formData.services.join(", "),
        status: "Pendiente",
        notes: formData.message || "Consulta ingresada desde la web.",
      };

      localStorage.setItem("turns", JSON.stringify([newLead, ...initialTurns]));
    } catch (error) {
      console.error("No se guardo el lead localmente:", error);
    }

    const encodedText = encodeURIComponent(whatsappText);
    const nativeAppUrl = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedText}`;
    const webAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;

    window.location.href = nativeAppUrl;

    setTimeout(() => {
      window.open(webAppUrl, "_blank");
    }, 1500);
  }

  return (
    <section className="section inquiry-page">
      <div className="container inquiry-shell">
        <div className="inquiry-intro">
          <span className="section-kicker">Consulta personalizada</span>
          <h1 className="section-title">Contanos que necesita tu vehiculo.</h1>
          <p className="section-text">
            Completa la consulta con la informacion clave y te abrimos WhatsApp con
            el mensaje listo para responderte de forma directa y con contexto.
          </p>

          <div className="inquiry-feature-list">
            <article className="inquiry-feature-card">
              <Sparkles size={18} />
              <div>
                <strong>Asesoria clara</strong>
                <span>Te orientamos segun el estado y el uso real del vehiculo.</span>
              </div>
            </article>

            <article className="inquiry-feature-card">
              <MessageCircle size={18} />
              <div>
                <strong>Respuesta directa</strong>
                <span>La consulta sale armada y lista para continuar por WhatsApp.</span>
              </div>
            </article>

            <article className="inquiry-feature-card">
              <ShieldCheck size={18} />
              <div>
                <strong>Seguimiento interno</strong>
                <span>Tambien queda registrada para ordenar el seguimiento desde el panel.</span>
              </div>
            </article>
          </div>
        </div>

        <form className="inquiry-form-panel" onSubmit={handleSubmit}>
          <div className="inquiry-form-grid">
            <div className="inquiry-form-group">
              <label>Nombre y apellido</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Miguel Torres"
                required
              />
            </div>

            <div className="inquiry-form-group">
              <label>WhatsApp / Telefono</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Codigo de area + numero"
                required
              />
            </div>
          </div>

          <div className="inquiry-form-group">
            <label>Vehiculo</label>
            <div className="options-grid">
              {VEHICLE_OPTIONS.map((vehicle) => {
                const isSelected = formData.vehicle === vehicle;

                return (
                  <button
                    key={vehicle}
                    type="button"
                    className={`option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => selectVehicle(vehicle)}
                  >
                    <span>{vehicle}</span>
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="inquiry-form-group">
            <label>Servicios que te interesan</label>
            <div className="options-grid options-grid-services">
              {availableServices.map((service) => {
                const isSelected = formData.services.includes(service);

                return (
                  <button
                    key={service}
                    type="button"
                    className={`option-card option-card-service ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleService(service)}
                  >
                    <span>{service}</span>
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="inquiry-form-group">
            <label>Detalle adicional</label>
            <textarea
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              placeholder="Podes contarnos el estado general del vehiculo, que resultado buscas o cualquier detalle importante."
            />
          </div>

          <div className="inquiry-submit-row">
            <p className="inquiry-submit-note">
              Al enviar, abrimos WhatsApp con tu consulta ya preparada para continuar la conversacion.
            </p>
            <button type="submit" className="btn-primary inquiry-submit">
              <MessageCircle size={18} />
              Enviar consulta
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default InquiryForm;
