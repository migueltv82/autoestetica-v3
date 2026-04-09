import { useState } from "react";
import { Calendar, User, Phone, Wrench, Clock, ClipboardList, Car, CheckCircle2 } from "lucide-react";

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
    <div className="inquiry-form-container" style={{ minHeight: 'auto', padding: '3rem', margin: '0' }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
         <div>
           <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "2rem", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
             Detalles del Nuevo Turno
           </h3>
           
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
              <div className="inquiry-form-group">
                <label><User size={14} style={{display:'inline', marginRight: '5px'}}/> Cliente</label>
                <input type="text" name="client" value={formData.client} onChange={handleChange} placeholder="Nombre completo" required />
              </div>
              
              <div className="inquiry-form-group">
                <label><Phone size={14} style={{display:'inline', marginRight: '5px'}}/> WhatsApp</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Cod de área + número" required />
              </div>

              <div className="inquiry-form-group">
                <label><Clock size={14} style={{display:'inline', marginRight: '5px'}}/> Horario Sugerido</label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                  <input type="time" name="time" value={formData.time} onChange={handleChange} required />
                </div>
              </div>

              <div className="inquiry-form-group">
                <label><Wrench size={14} style={{display:'inline', marginRight: '5px'}}/> Servicio Principal</label>
                <select name="service" value={formData.service} onChange={handleChange} required>
                  <option value="">Seleccionar...</option>
                  {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="inquiry-form-group">
                <label><Car size={14} style={{display:'inline', marginRight: '5px'}}/> Vehículo</label>
                <select name="vehicle" value={formData.vehicle} onChange={handleChange}>
                  {VEHICLE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
           </div>
         </div>
         
         <div className="inquiry-form-group">
            <label><ClipboardList size={14} style={{display:'inline', marginRight: '5px'}}/> Notas Adicionales</label>
            <textarea 
              name="notes" 
              rows="2" 
              value={formData.notes} 
              onChange={handleChange} 
              placeholder="Especificaciones técnicas o pedidos especiales..." 
              style={{ resize: "none" }}
            />
         </div>

         <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "2rem" }}>
           <button type="submit" className="btn-form-primary" style={{ width: "auto", minWidth: "220px", margin: 0 }}>
             <CheckCircle2 size={20} /> Agendar Turno
           </button>
         </div>
      </form>
    </div>
  );
}

export default TurnForm;