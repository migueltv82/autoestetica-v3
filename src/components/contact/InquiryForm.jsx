import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import "./InquiryForm.css";

const VEHICLE_OPTIONS = ["Auto", "Camioneta", "SUV", "Moto", "Bicicleta"];

const WHATSAPP_NUMBER = "5493815448147";

function InquiryForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicle: "",
    service: "",
    message: "",
  });

  const availableServices = useMemo(() => {
    if (formData.vehicle === "Moto") {
      return ["Lavado y detallado de motos"];
    }
    if (formData.vehicle === "Bicicleta") {
      return ["Lavado y detallado de bicicletas"];
    }
    // Opciones generales para vehículos de 4 ruedas
    return [
      "Lavado premium",
      "Limpieza de interior",
      "Pulido y abrillantado",
      "Lavado de motor",
    ];
  }, [formData.vehicle]);

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

  function handleNext() {
    if (step === 1 && !formData.vehicle) return alert("Selecciona un vehículo");
    if (step === 2 && !formData.service) return alert("Selecciona un servicio");
    setStep((s) => s + 1);
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Completa tu nombre y teléfono");
      return;
    }
    window.open(whatsappUrl, "_blank");
  }

  return (
    <section className="section">
      <div className="container inquiry-grid">
        <div className="inquiry-header">
          <span className="section-kicker">Consulta (Paso {step} de 3)</span>
          <h1 className="section-title">Contanos qué necesitás</h1>
          <p className="section-text">
            Completá unos breves pasos y abriremos WhatsApp con la info lista.
          </p>

          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? "active" : ""}`} />
            <div className={`step-dot ${step >= 2 ? "active" : ""}`} />
            <div className={`step-dot ${step >= 3 ? "active" : ""}`} />
          </div>
        </div>

        <div className="inquiry-form-container">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="form-step"
              >
                <h3>1. ¿Qué vehículo tienes?</h3>
                <div className="options-grid">
                  {VEHICLE_OPTIONS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`option-card ${formData.vehicle === v ? "selected" : ""}`}
                      onClick={() => setFormData({ ...formData, vehicle: v, service: "" })}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-primary mt-4"
                  onClick={handleNext}
                  disabled={!formData.vehicle}
                >
                  Continuar <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="form-step"
              >
                <h3>2. ¿Qué servicio te interesa para tu {formData.vehicle.toLowerCase()}?</h3>
                <div className="options-grid">
                  {availableServices.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`option-card ${formData.service === s ? "selected" : ""}`}
                      onClick={() => setFormData({ ...formData, service: s })}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="step-actions mt-4">
                  <button type="button" className="btn-secondary" onClick={handleBack}>
                    <ArrowLeft size={18} /> Volver
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleNext}
                    disabled={!formData.service}
                  >
                    Continuar <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="form-step"
                onSubmit={handleSubmit}
              >
                <h3>3. Tus datos de contacto</h3>
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
                  <label>WhatsApp / Teléfono</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="381..."
                    required
                  />
                </div>
                <div className="inquiry-form-group">
                  <label>Mensaje opcional</label>
                  <textarea
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Escribí alguna aclaración"
                  />
                </div>
                <div className="step-actions mt-4">
                  <button type="button" className="btn-secondary" onClick={handleBack}>
                    <ArrowLeft size={18} /> Volver
                  </button>
                  <button type="submit" className="btn-primary inquiry-submit">
                    Enviar a WhatsApp
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default InquiryForm;