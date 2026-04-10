import { useState } from "react";
import { Calendar, User, Phone, Wrench, Clock, ClipboardList, Car, CheckCircle2 } from "lucide-react";
import "./TurnForm.css";

const VEHICLE_OPTIONS = ["Auto", "Camioneta", "SUV", "Moto", "Bicicleta"];

const SERVICE_OPTIONS = [
  "Lavado premium",
  "Limpieza de interior",
  "Pulido y abrillantado",
  "Lavado de motor",
  "Lavado y detallado de motos",
  "Lavado y detallado de bicicletas",
];

const initialForm = {
  date: "",
  time: "",
  client: "",
  phone: "",
  vehicle: "Auto",
  service: "",
  status: "Pendiente",
  notes: "",
};

function TurnForm({ onAddTurn }) {
  const [formData, setFormData] = useState(initialForm);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!formData.date || !formData.time || !formData.client.trim() || !formData.phone.trim() || !formData.service) {
      return;
    }

    onAddTurn({ id: Date.now(), ...formData });
    setFormData(initialForm);
  }

  return (
    <section className="admin-form-shell turn-form-shell">
      <div className="admin-form-header">
        <div>
          <span className="admin-form-kicker">
            <Calendar size={14} /> Agenda manual
          </span>
          <h3 className="admin-form-title">Cargar nuevo turno</h3>
          <p className="admin-form-description">
            Completa los datos base del cliente y la cita queda registrada al instante.
          </p>
        </div>
        <div className="turn-form-badge">Alta directa</div>
      </div>

      <form className="turn-form" onSubmit={handleSubmit}>
        <div className="admin-form-grid wide turn-form-grid">
          <div className="admin-form-group">
            <label>
              <User size={14} /> Cliente
            </label>
            <input type="text" name="client" value={formData.client} onChange={handleChange} placeholder="Nombre completo" required />
          </div>

          <div className="admin-form-group">
            <label>
              <Phone size={14} /> WhatsApp
            </label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Codigo de area + numero" required />
          </div>

          <div className="admin-form-group turn-form-schedule">
            <label>
              <Clock size={14} /> Fecha y horario
            </label>
            <div className="turn-form-inline">
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              <input type="time" name="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

          <div className="admin-form-group">
            <label>
              <Wrench size={14} /> Servicio principal
            </label>
            <select name="service" value={formData.service} onChange={handleChange} required>
              <option value="">Seleccionar...</option>
              {SERVICE_OPTIONS.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label>
              <Car size={14} /> Vehiculo
            </label>
            <select name="vehicle" value={formData.vehicle} onChange={handleChange}>
              {VEHICLE_OPTIONS.map((vehicle) => (
                <option key={vehicle} value={vehicle}>
                  {vehicle}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-group turn-form-notes">
            <label>
              <ClipboardList size={14} /> Notas adicionales
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Especificaciones tecnicas o pedidos especiales..."
            />
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn-form-primary turn-form-submit">
            <CheckCircle2 size={18} /> Agendar turno
          </button>
        </div>
      </form>
    </section>
  );
}

export default TurnForm;
