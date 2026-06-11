import { useState } from "react";
import { 
  Calendar, 
  User, 
  Phone, 
  Wrench, 
  Clock, 
  ClipboardList, 
  Car, 
  CheckCircle2, 
  Wallet 
} from "lucide-react";
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
  amount: "",
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
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    onAddTurn(formData);
    setFormData(initialForm);
  }

  return (
    <div className="admin-form-shell turn-form-shell">
      <div className="admin-form-header">
        <div>
          <span className="admin-form-kicker">
            <Calendar size={14} /> Alta Directiva
          </span>
          <h3 className="admin-form-title">Nueva Cita Operativa</h3>
          <p className="admin-form-description">
            Carga los datos y el sistema sincronizará clientes y caja automáticamente.
          </p>
        </div>
      </div>

      <form className="turn-form" onSubmit={handleSubmit}>
        <div className="admin-form-grid wide turn-form-grid">
          <div className="admin-form-group">
            <label><User size={14} /> Nombre del Cliente</label>
            <input type="text" name="client" value={formData.client} onChange={handleChange} placeholder="Ej: Juan Pérez" required />
          </div>

          <div className="admin-form-group">
            <label><Phone size={14} /> WhatsApp</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="381544..." required />
          </div>

          <div className="admin-form-group">
            <label><Clock size={14} /> Fecha y Hora</label>
            <div className="turn-form-inline">
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              <input type="time" name="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

          <div className="admin-form-group">
            <label><Wrench size={14} /> Servicio</label>
            <select name="service" value={formData.service} onChange={handleChange} required>
              <option value="">Seleccionar...</option>
              {SERVICE_OPTIONS.map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label><Car size={14} /> Tipo de Vehículo</label>
            <select name="vehicle" value={formData.vehicle} onChange={handleChange}>
              {VEHICLE_OPTIONS.map((vehicle) => (
                <option key={vehicle} value={vehicle}>{vehicle}</option>
              ))}
            </select>
          </div>

          <div className="admin-form-group">
            <label><Wallet size={14} /> Importe de Reserva / Total ($)</label>
            <input 
              type="number" 
              name="amount" 
              value={formData.amount} 
              onChange={handleChange} 
              placeholder="0" 
            />
          </div>

          <div className="admin-form-group full-width">
            <label><ClipboardList size={14} /> Notas</label>
            <textarea
              name="notes"
              rows="2"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Detalles adicionales del trabajo..."
            />
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn-primary-admin" style={{ width: 'auto' }}>
            <CheckCircle2 size={18} /> Confirmar y Guardar Todo
          </button>
        </div>
      </form>
    </div>
  );
}

export default TurnForm;
