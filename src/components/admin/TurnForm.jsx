import { useState } from "react";
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

const STATUS_OPTIONS = ["Pendiente", "Confirmado", "Finalizado", "Cancelado"];

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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!formData.date) {
      alert("Ingresá la fecha del turno.");
      return;
    }

    if (!formData.time) {
      alert("Ingresá la hora del turno.");
      return;
    }

    if (!formData.client.trim()) {
      alert("Ingresá el nombre del cliente.");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Ingresá un teléfono.");
      return;
    }

    if (!formData.service) {
      alert("Seleccioná un servicio.");
      return;
    }

    const newTurn = {
      id: Date.now(),
      ...formData,
    };

    onAddTurn(newTurn);
    setFormData(initialForm);
  }

  return (
    <form className="turn-form" onSubmit={handleSubmit}>
      <div className="turn-form-grid">
        <div className="turn-form-group">
          <label>Fecha</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} />
        </div>

        <div className="turn-form-group">
          <label>Hora</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} />
        </div>

        <div className="turn-form-group">
          <label>Cliente</label>
          <input
            type="text"
            name="client"
            value={formData.client}
            onChange={handleChange}
            placeholder="Nombre del cliente"
          />
        </div>

        <div className="turn-form-group">
          <label>Teléfono</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="381..."
          />
        </div>

        <div className="turn-form-group">
          <label>Vehículo</label>
          <select name="vehicle" value={formData.vehicle} onChange={handleChange}>
            {VEHICLE_OPTIONS.map((vehicle) => (
              <option key={vehicle} value={vehicle}>
                {vehicle}
              </option>
            ))}
          </select>
        </div>

        <div className="turn-form-group">
          <label>Servicio</label>
          <select name="service" value={formData.service} onChange={handleChange}>
            <option value="">Seleccioná un servicio</option>
            {SERVICE_OPTIONS.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        <div className="turn-form-group">
          <label>Estado</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="turn-form-group">
        <label>Observaciones</label>
        <textarea
          name="notes"
          rows="4"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Detalle interno del turno"
        />
      </div>

      <button type="submit" className="turn-form-button">
        Guardar turno
      </button>
    </form>
  );
}

export default TurnForm;