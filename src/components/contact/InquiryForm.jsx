import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, MessageCircle, Sparkles, Send } from "lucide-react";
import "./InquiryForm.css";

const VEHICLE_OPTIONS = ["Auto", "Camioneta", "SUV", "Moto", "Bicicleta"];
const WHATSAPP_NUMBER = "5493815448147";

function InquiryForm() {
  const [step, setStep] = useState(1);
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
      "Lavado Premium",
      "Limpieza y detallado interior",
      "Pulido y abrillantado",
      "Tratamiento acrílico / cerámico",
      "Limpieza de motor",
    ];
  }, [formData.vehicle]);

  const whatsappText = useMemo(() => {
    return [
      "Hola, quiero hacer una consulta.",
      "",
      `*Nombre:* ${formData.name || "-"}`,
      `*Teléfono:* ${formData.phone || "-"}`,
      `*Vehículo:* ${formData.vehicle || "-"}`,
      `*Servicios:* ${formData.services.length > 0 ? formData.services.join(", ") : "-"}`,
      `*Consulta:* ${formData.message || "-"}`,
    ].join("\n");
  }, [formData]);

  const handleNext = () => {
    if (step === 1 && !formData.vehicle) return;
    if (step === 2 && formData.services.length === 0) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleService = (s) => {
    setFormData((prev) => {
      const current = prev.services;
      if (current.includes(s)) {
        return { ...prev, services: current.filter((item) => item !== s) };
      } else {
        return { ...prev, services: [...current, s] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    // 1. Opcion 1: Guardar la consulta discretamente en la base de datos (Admin Dashboard)
    try {
      const existingTurns = JSON.parse(localStorage.getItem("turns") || "[]");
      const initialTurns = existingTurns.length > 0 ? existingTurns : [
        { id: 1, date: "2026-03-25", time: "10:00", client: "Juan Pérez", phone: "3815550001", vehicle: "Auto", service: "Lavado premium", status: "Pendiente", notes: "" },
        { id: 2, date: "2026-03-25", time: "12:00", client: "María López", phone: "3815550002", vehicle: "Camioneta", service: "Limpieza de interior", status: "Confirmado", notes: "" }
      ];

      const newLead = {
        id: Date.now(), // ID incremental simulado
        date: new Date().toISOString().split("T")[0],
        time: "---", // Consulta a definir
        client: formData.name,
        phone: formData.phone,
        vehicle: formData.vehicle,
        service: formData.services.join(", "),
        status: "Pendiente",
        notes: formData.message || "Consulta ingresada desde la web.",
      };
      
      localStorage.setItem("turns", JSON.stringify([newLead, ...initialTurns]));
    } catch (err) {
      console.error("No se guardó el lead localmente: ", err);
    }

    // 2. Opción 2: Intentar forzar la aplicación nativa de WhatsApp
    const encodedText = encodeURIComponent(whatsappText);
    const nativeAppUrl = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedText}`;
    const webAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;

    // Intentamos cargar la app nativa en el celular/desktop directamente
    window.location.href = nativeAppUrl;

    // Con un fallback: si en 1.5s la app nativa no respondió o no existe (Desktop sin app nativa), abrir pestaña Web
    setTimeout(() => {
      window.open(webAppUrl, "_blank");
    }, 1500);
  };

  return (
    <section className="inquiry-section">
      <div className="inquiry-bg-glow"></div>
      
      <div className="container inquiry-grid">
        <div className="inquiry-header">
          <motion.div initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <span className="inquiry-kicker">
              <Sparkles size={14} style={{ display: "inline", marginBottom: "-2px" }} />
              Paso {step} de 3
            </span>
            <h1 className="inquiry-title">Construyamos la perfección</h1>
            <p className="inquiry-text">
              Cada vehículo es único y merece un enfoque especializado. Completá este breve formulario y prepararemos 
              una asesoría personalizada para elevar la estética de tu unidad.
            </p>
          </motion.div>

          <motion.div className="step-indicator" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 }} viewport={{ once: true }}>
            <div className={`step-dot ${step >= 1 ? "active" : ""}`} />
            <div className={`step-dot ${step >= 2 ? "active" : ""}`} />
            <div className={`step-dot ${step >= 3 ? "active" : ""}`} />
          </motion.div>
        </div>

        <motion.div 
          className="inquiry-form-container"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
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
                <h3 className="step-title">1. ¿Qué vehículo tenés?</h3>
                <div className="options-grid">
                  {VEHICLE_OPTIONS.map((v) => (
                    <div
                      key={v}
                      role="button"
                      className={`option-card ${formData.vehicle === v ? "selected" : ""}`}
                      onClick={() => setFormData({ ...formData, vehicle: v, services: [] })}
                    >
                      <span>{v}</span>
                      <CheckCircle2 size={20} className="option-icon" />
                    </div>
                  ))}
                </div>
                <div className="step-actions mt-4">
                  <button
                    type="button"
                    className="btn-form-primary"
                    onClick={handleNext}
                    disabled={!formData.vehicle}
                  >
                    Continuar <ArrowRight size={20} />
                  </button>
                </div>
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
                <h3 className="step-title">2. ¿Qué tratamiento buscás?</h3>
                <div className="options-grid">
                  {availableServices.map((s) => (
                    <div
                      key={s}
                      role="button"
                      className={`option-card ${formData.services.includes(s) ? "selected" : ""}`}
                      onClick={() => toggleService(s)}
                    >
                      <span>{s}</span>
                      <CheckCircle2 size={20} className="option-icon" />
                    </div>
                  ))}
                </div>
                <div className="step-actions mt-4">
                  <button type="button" className="btn-form-secondary" onClick={handleBack}>
                    <ArrowLeft size={18} /> Volver
                  </button>
                  <button
                    type="button"
                    className="btn-form-primary"
                    onClick={handleNext}
                    disabled={formData.services.length === 0}
                  >
                    Continuar <ArrowRight size={20} />
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
                <h3 className="step-title">3. Tus datos de contacto</h3>
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
                    placeholder="Cod de área + Número"
                    required
                  />
                </div>
                <div className="inquiry-form-group">
                  <label>Mensaje opcional</label>
                  <textarea
                    name="message"
                    rows="2"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="¿Algún detalle importante de tu vehículo?"
                  />
                </div>
                <div className="step-actions mt-4">
                  <button type="button" className="btn-form-secondary" onClick={handleBack}>
                    <ArrowLeft size={18} /> Volver
                  </button>
                  <button type="submit" className="btn-form-primary btn-whatsapp">
                    <Send size={18} /> Enviar consulta
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

export default InquiryForm;