import { useMemo, useState } from "react";
import { Calendar, Car, Check, CheckCircle2, ClipboardList, Clock, CreditCard, Phone, User, Wallet, Wrench } from "lucide-react";
import { useServices } from "../../hooks/useServices";
import { getServicePriceForVehicle } from "../../utils/servicePricing";
import { useFeedback } from "../../hooks/useFeedback";
import "./TurnForm.css";

const VEHICLE_OPTIONS = ["Auto", "Camioneta", "SUV", "Moto", "Bicicleta"];
const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const initialForm = { date: "", time: "", client: "", phone: "", vehicle: "Auto", services: [], status: "Confirmado", notes: "", paymentMethod: "Efectivo", registerPayment: true };

function TurnForm({ onAddTurn, initialData = null }) {
  const { services, isLoading } = useServices();
  const { notify } = useFeedback();
  const [formData, setFormData] = useState(() => initialData ? { date: initialData.date || "", time: initialData.time || "", client: initialData.client || "", phone: initialData.phone || "", vehicle: initialData.vehicle || "Auto", services: (initialData.services || []).map((service) => ({ serviceId: service.service_id, name: service.description, price: Number(service.unit_price || 0), durationMinutes: Number(service.services?.estimated_minutes || 0) })), status: initialData.status || "Confirmado", notes: initialData.notes || "", paymentMethod: "Efectivo", registerPayment: false } : initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = useMemo(() => formData.services.reduce((sum, service) => sum + Number(service.price || 0), 0), [formData.services]);
  const durationMinutes = useMemo(() => formData.services.reduce((sum, service) => sum + Number(service.durationMinutes || 0), 0) || initialData?.durationMinutes || 120, [formData.services, initialData]);
  const isEditing = Boolean(initialData);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => {
      if (name !== "vehicle") return { ...current, [name]: value };
      return { ...current, vehicle: value, services: current.services.map((selected) => {
        const catalogService = services.find((service) => service.id === selected.serviceId);
        if (!catalogService || catalogService.priceOnRequest) return selected;
        return { ...selected, price: getServicePriceForVehicle(catalogService, value) };
      }) };
    });
  }
  function toggleService(service) {
    setFormData((current) => {
      const selected = current.services.some((item) => item.serviceId === service.id);
      const vehiclePrice = getServicePriceForVehicle(service, current.vehicle);
      return { ...current, services: selected ? current.services.filter((item) => item.serviceId !== service.id) : [...current.services, { serviceId: service.id, name: service.name, price: service.priceOnRequest ? 0 : Number(vehiclePrice || 0), priceOnRequest: service.priceOnRequest, durationMinutes: service.durationMinutes }] };
    });
  }
  function updatePrice(serviceId, price) {
    setFormData((current) => ({ ...current, services: current.services.map((service) => service.serviceId === serviceId ? { ...service, price } : service) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.date || !formData.time || !formData.client.trim() || !formData.phone.trim() || !formData.services.length) {
      notify("Completa cliente, WhatsApp, fecha, hora y al menos un servicio.", "error");
      return;
    }
    if (!isEditing && formData.registerPayment && total <= 0) {
      notify("Ingresa el valor de los servicios para registrar el cobro en Caja.", "error");
      return;
    }
    setIsSubmitting(true);
    try { await onAddTurn({ ...formData, amount: total, durationMinutes }); setFormData(initialForm); } catch { /* conservar datos */ }
    setIsSubmitting(false);
  }

  return (
    <div className="admin-form-shell turn-form-shell">
      <div className="admin-form-header"><div><span className="admin-form-kicker"><Calendar size={14} /> Nuevo turno</span><h3 className="admin-form-title">Datos del cliente y del trabajo</h3><p className="admin-form-description">Al guardar, el cliente, los servicios y el cobro quedan relacionados automáticamente.</p></div></div>
      <form className="turn-form" onSubmit={handleSubmit}>
        <div className="admin-form-grid wide turn-form-grid">
          <div className="admin-form-group"><label><User size={14} /> Nombre del cliente</label><input type="text" name="client" value={formData.client} onChange={handleChange} placeholder="Ej: Juan Pérez" required /></div>
          <div className="admin-form-group"><label><Phone size={14} /> WhatsApp</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="381 555 0000" required /></div>
          <div className="admin-form-group"><label><Clock size={14} /> Fecha y hora</label><div className="turn-form-inline"><input type="date" name="date" value={formData.date} onChange={handleChange} required /><input type="time" name="time" value={formData.time} onChange={handleChange} required /></div></div>
          <div className="admin-form-group"><label><Car size={14} /> Vehículo</label><select name="vehicle" value={formData.vehicle} onChange={handleChange}>{VEHICLE_OPTIONS.map((vehicle) => <option key={vehicle}>{vehicle}</option>)}</select></div>

          <div className="admin-form-group full-width turn-services-field">
            <label><Wrench size={14} /> Servicios — podés elegir más de uno</label>
            <div className="turn-service-picker">
              {isLoading ? <span className="turn-service-loading">Cargando servicios…</span> : services.map((service) => {
                const selected = formData.services.some((item) => item.serviceId === service.id);
                const vehiclePrice = getServicePriceForVehicle(service, formData.vehicle);
                return <button type="button" key={service.id} className={`turn-service-option ${selected ? "selected" : ""}`} onClick={() => toggleService(service)}><span className="turn-service-check">{selected ? <Check size={14} /> : null}</span><span><strong>{service.name}</strong><small>{service.duration}</small></span><b>{service.priceOnRequest ? "Consultar" : vehiclePrice > 0 ? money.format(vehiclePrice) : "Definir precio"}</b></button>;
              })}
            </div>
          </div>

          {formData.services.length ? <div className="turn-selected-services full-width"><div className="turn-selected-heading"><span>Detalle seleccionado · {Math.floor(durationMinutes / 60) ? `${Math.floor(durationMinutes / 60)} h ` : ""}{durationMinutes % 60 ? `${durationMinutes % 60} min` : ""}</span><strong>Total: {money.format(total)}</strong></div>{formData.services.map((service) => <div className="turn-selected-row" key={service.serviceId}><span>{service.name}</span><label>Precio<input type="number" min="0" value={service.price} onChange={(event) => updatePrice(service.serviceId, event.target.value)} /></label></div>)}</div> : null}

          <div className="admin-form-group"><label><CreditCard size={14} /> Medio de pago</label><select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}><option>Efectivo</option><option>Transferencia</option><option>Tarjeta</option><option>Billetera virtual</option></select></div>
          <label className="turn-payment-toggle"><input type="checkbox" checked={formData.registerPayment} onChange={(event) => setFormData((current) => ({ ...current, registerPayment: event.target.checked }))} /><span><Wallet size={17} /><strong>Registrar el cobro en caja</strong><small>Desmarcalo si el cliente todavía no pagó.</small></span></label>
          <div className="admin-form-group full-width"><label><ClipboardList size={14} /> Notas</label><textarea name="notes" rows="2" value={formData.notes} onChange={handleChange} placeholder="Detalles adicionales del trabajo..." /></div>
        </div>
        <div className="admin-form-actions"><div className="turn-form-total"><span>Total del turno</span><strong>{money.format(total)}</strong></div><button type="submit" className="btn-primary-admin" disabled={isSubmitting}><CheckCircle2 size={18} />{isSubmitting ? "Guardando…" : "Confirmar turno"}</button></div>
      </form>
    </div>
  );
}

export default TurnForm;
