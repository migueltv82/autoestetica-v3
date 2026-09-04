import { useMemo, useState } from "react";
import {
  Car,
  CircleDollarSign,
  Edit2,
  Eye,
  History,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Star,
  Stamp,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import StatCard from "../../components/ui/StatCard";
import EmptyState from "../../components/ui/EmptyState";
import ClientsGridSkeleton from "../../components/admin/ClientsGridSkeleton";
import { useClients } from "../../hooks/useClients";
import { useFeedback } from "../../hooks/useFeedback";
import { useSettings } from "../../hooks/useSettings";
import { usePermissions } from "../../hooks/usePermissions";
import { clientWhatsAppLink, readyVehicleWhatsAppLink } from "../../utils/whatsapp";
import ClientFidelityCard from "../../components/admin/ClientFidelityCard";
import Modal from "../../components/ui/Modal";
import { useFidelitySummaries } from "../../hooks/useFidelitySummaries";
import { formatMoney } from "../../utils/money";
import "./Clients.css";
import "./ClientProfileModal.css";

const EMPTY_CLIENT = { name: "", phone: "", email: "", notes: "", vehicle: "Auto" };
const EMPTY_VEHICLE = { type: "Auto", brand: "", model: "", licensePlate: "", color: "", year: "" };

function Clients() {
  const { clients, totalClients, frequentClients, newThisMonth, totalCount, hasMore, loadMore, isLoadingMore, search, setSearch, isLoading, error, addClient, updateClient, deleteClient, addVehicle, deleteVehicle } = useClients();
  const { confirm, notify } = useFeedback();
  const { settings, updateSettings } = useSettings();
  const { canManageClients, canManageFinance, canManageSettings } = usePermissions();
  const fidelityCards = useFidelitySummaries();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_CLIENT);
  const [selectedId, setSelectedId] = useState(null);
  const [vehicleForm, setVehicleForm] = useState(EMPTY_VEHICLE);
  const [readyMessage, setReadyMessage] = useState("");
  const [savingReadyMessage, setSavingReadyMessage] = useState(false);
  const selectedClient = clients.find((client) => client.id === selectedId);
  const fidelityCardsByClient = useMemo(
    () => fidelityCards.reduce((cardsByClient, card) => {
      if (["active", "reward_ready"].includes(card.status)) {
        const summary = cardsByClient.get(card.clientId) || { count: 0, rewardReady: false };
        cardsByClient.set(card.clientId, { count: summary.count + 1, rewardReady: summary.rewardReady || card.status === "reward_ready" });
      }
      return cardsByClient;
    }, new Map()),
    [fidelityCards],
  );


  function resetForm() {
    setFormData(EMPTY_CLIENT);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return notify("Completa el nombre y el telefono.", "error");
    try {
      if (editingId) {
        await updateClient(editingId, formData);
        notify("Cliente actualizado.", "success");
      } else {
        await addClient(formData);
        notify("Cliente agregado.", "success");
      }
      resetForm();
    } catch (saveError) {
      notify(saveError.message || "No se pudo guardar el cliente.", "error");
    }
  }

  function handleEdit(client) {
    setFormData({ name: client.name, phone: client.phone, email: client.email, notes: client.notes, vehicle: client.vehicle });
    setEditingId(client.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const accepted = await confirm({
      title: "Eliminar cliente",
      message: "Se eliminarán definitivamente el cliente, sus vehículos, turnos, tarjetas, pagos y recibos. Los movimientos históricos de Caja se conservarán.",
      confirmLabel: "Eliminar cliente y datos",
    });
    if (!accepted) return;
    try {
      await deleteClient(id);
      if (selectedId === id) setSelectedId(null);
      notify("Cliente eliminado.", "success");
    } catch (deleteError) {
      notify(deleteError.message || "No se pudo eliminar el cliente.", "error");
    }
  }

  function openClientProfile(client) {
    setSelectedId(client.id);
    setReadyMessage(settings.readyMessageTemplate || "");
  }

  async function handleAddVehicle(event) {
    event.preventDefault();
    try {
      await addVehicle(selectedClient.id, vehicleForm);
      setVehicleForm(EMPTY_VEHICLE);
      notify("Vehiculo agregado.", "success");
    } catch (vehicleError) {
      notify(vehicleError.message, "error");
    }
  }

  async function handleDeleteVehicle(id) {
    const accepted = await confirm({
      title: "Eliminar vehiculo",
      message: "El vehiculo dejara de aparecer en la ficha del cliente.",
      confirmLabel: "Eliminar",
    });
    if (!accepted) return;
    try {
      await deleteVehicle(id);
      notify("Vehiculo eliminado.", "success");
    } catch (vehicleError) {
      notify(vehicleError.message, "error");
    }
  }

  async function saveReadyMessage() {
    if (!readyMessage.trim()) return notify("El mensaje no puede quedar vacio.", "error");
    setSavingReadyMessage(true);
    try {
      await updateSettings({ ...settings, readyMessageTemplate: readyMessage.trim() });
      notify("Mensaje guardado.", "success");
    } catch (saveError) {
      notify(saveError.message || "No se pudo guardar el mensaje.", "error");
    } finally {
      setSavingReadyMessage(false);
    }
  }

  return (
    <PageTransition>
      <AdminLayout title="Directorio de clientes" subtitle="Contacto, vehiculos e historial en una sola vista.">
        <section className="admin-stats-grid clients-stats">
          <StatCard label="Total clientes" value={totalClients} icon={<Users size={22} />} color="var(--color-primary)" trend="Base activa" />
          <StatCard label="Clientes frecuentes" value={frequentClients} icon={<Star size={22} />} color="#facc15" trend="3 o mas visitas" />
          <StatCard label="Nuevos este mes" value={newThisMonth} icon={<UserPlus size={22} />} color="#38bdf8" trend="Altas registradas" />
        </section>

        <AdminPageHeader
          eyebrow="Clientes"
          icon={<Users size={18} />}
          title="Base de clientes"
          subtitle="Busca por nombre, telefono, email, patente o vehiculo."
          actions={canManageClients ? (
            <button type="button" className={showForm ? "btn-ghost" : "btn-premium"} onClick={() => showForm ? resetForm() : setShowForm(true)}>
              {showForm ? <X size={18} /> : <Plus size={18} />}
              <span>{showForm ? "Cancelar" : "Nuevo cliente"}</span>
            </button>
          ) : null}
        />

        {showForm && canManageClients ? (
          <section className="clients-form admin-form-shell">
            <div className="admin-form-header">
              <div><span className="admin-form-kicker">{editingId ? "Edicion" : "Alta"}</span><h3 className="admin-form-title">{editingId ? "Actualizar cliente" : "Registrar cliente"}</h3></div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid wide">
                <div className="admin-form-group"><label><Users size={14} /> Nombre completo *</label><input required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Ej: Roberto Gomez" autoComplete="name" /></div>
                <div className="admin-form-group"><label><Phone size={14} /> WhatsApp *</label><input required type="tel" inputMode="tel" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} placeholder="3814000000" autoComplete="tel" /></div>
                <div className="admin-form-group"><label><Mail size={14} /> Email</label><input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="cliente@email.com" autoComplete="email" /></div>
                <div className="admin-form-group"><label><Car size={14} /> Vehiculo principal</label><select value={formData.vehicle} onChange={(event) => setFormData({ ...formData, vehicle: event.target.value })}><option>Auto</option><option>Camioneta</option><option>SUV</option><option>Moto</option><option>Bicicleta</option><option>Furgon</option></select></div>
                <div className="admin-form-group full-width"><label>Notas</label><textarea rows="2" value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} placeholder="Preferencias, cuidados o informacion util..." /></div>
              </div>
              <div className="admin-form-actions"><button type="submit" className="btn-form-primary">{editingId ? "Guardar cambios" : "Confirmar alta"}</button></div>
            </form>
          </section>
        ) : null}

        <div className="clients-toolbar">
          <div className="admin-search-shell">
            <Search size={18} className="admin-search-icon" />
            <input className="admin-search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente, telefono, patente..." aria-label="Buscar clientes" />
            {search ? <button type="button" onClick={() => setSearch("")} aria-label="Limpiar busqueda"><X size={16} /></button> : null}
          </div>
          <span>{totalCount} {totalCount === 1 ? "resultado" : "resultados"}</span>
        </div>
        {error ? <div className="clients-error" role="alert">No pudimos actualizar el directorio. Revisa la conexion.</div> : null}

        {!isLoading && clients.length ? (
          <section className="clients-directory" aria-label="Directorio de clientes">
            {clients.map((client) => {
              const isVip = Number(client.visits) >= 3;
              const fidelityCard = fidelityCardsByClient.get(client.id);
              return (
                <article key={client.id} className={`client-card${selectedId === client.id ? " is-selected" : ""}`}>
                  <header>
                    <div className="client-avatar">{client.name.trim().charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="client-name-line"><h3>{client.name}</h3>{isVip ? <span><Star size={11} fill="currentColor" /> Frecuente</span> : null}</div>
                      {canManageClients ? <a href={`tel:${client.phone}`}><Phone size={13} /> {client.phone}</a> : <span className="client-phone-static"><Phone size={13} /> {client.phone}</span>}
                    </div>
                  </header>
                  <div className="client-card-facts">
                    <span><small>Vehiculo</small><strong><Car size={14} /> {client.vehicle}</strong></span>
                    <span><small>Trabajos</small><strong>{client.history.length}</strong></span>
                    <span className={fidelityCard?.rewardReady ? "fidelity-ready" : ""}><small>Fidelity</small><strong><Stamp size={14} /> {fidelityCard ? `${fidelityCard.count} ${fidelityCard.count === 1 ? "tarjeta" : "tarjetas"}` : "Sin tarjeta"}</strong></span>
                    {canManageFinance ? <span><small>Facturado</small><strong>{formatMoney(client.billed)}</strong></span> : null}
                    {canManageFinance ? <span><small>Saldo</small><strong className={client.balance ? "has-balance" : ""}>{formatMoney(client.balance)}</strong></span> : null}
                  </div>
                  <div className={`client-card-actions${canManageClients ? "" : " read-only"}`}>
                    <button type="button" className="client-open" onClick={() => openClientProfile(client)}><Eye size={15} /> Ver ficha</button>
                    {canManageClients ? <a className="client-ready" href={readyVehicleWhatsAppLink(client, settings.readyMessageTemplate, settings.openingHours)} target="_blank" rel="noreferrer"><MessageCircle size={15} /> Vehiculo listo</a> : null}
                    {canManageClients ? <button type="button" onClick={() => handleEdit(client)} aria-label={`Editar ${client.name}`}><Edit2 size={15} /></button> : null}
                    {canManageClients ? <button type="button" className="danger" onClick={() => handleDelete(client.id)} aria-label={`Eliminar ${client.name}`}><Trash2 size={15} /></button> : null}
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}

        {!isLoading && hasMore ? (
          <div className="clients-load-more">
            <button type="button" className="btn-ghost" onClick={loadMore} disabled={isLoadingMore}>
              {isLoadingMore ? "Cargando…" : "Cargar más clientes"}
            </button>
          </div>
        ) : null}

        {isLoading ? <ClientsGridSkeleton /> : null}
        {!isLoading && !clients.length ? (
          <EmptyState
            icon={<Users size={34} />}
            title={search ? "No encontramos coincidencias" : "Todavia no hay clientes"}
            text={search ? "Proba con otro nombre, telefono o patente." : "Los clientes se guardan al crear un turno o desde Nuevo cliente."}
            action={!search && canManageClients ? (
              <button type="button" className="btn-premium" onClick={() => setShowForm(true)}>
                <Plus size={16} /> <span>Nuevo cliente</span>
              </button>
            ) : null}
          />
        ) : null}

        {selectedClient ? (
          <Modal isOpen onClose={() => setSelectedId(null)} title={`Ficha de ${selectedClient.name}`} maxWidth="1000px">
          <section className="client-profile client-profile--modal">
            <header>
              <div><span className="admin-form-kicker">Ficha del cliente</span><h2>{selectedClient.name}</h2><p><Phone size={13} /> {selectedClient.phone}{selectedClient.email ? <><Mail size={13} /> {selectedClient.email}</> : null}</p></div>
              <div>{canManageClients ? <a href={clientWhatsAppLink(selectedClient, settings.businessName)} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a> : null}</div>
            </header>

            <div className="client-profile-stats">
              {canManageFinance ? <span><small>Facturado</small><strong>{formatMoney(selectedClient.billed)}</strong></span> : null}
              {canManageFinance ? <span><small>Pagado</small><strong>{formatMoney(selectedClient.paid)}</strong></span> : null}
              {canManageFinance ? <span><small>Saldo</small><strong className={selectedClient.balance ? "has-balance" : ""}>{formatMoney(selectedClient.balance)}</strong></span> : null}
              <span><small>Trabajos</small><strong>{selectedClient.history.length}</strong></span>
            </div>

            <ClientFidelityCard client={selectedClient} />

            {canManageClients ? <section className="client-ready">
              <div><span className="admin-form-kicker">Aviso de retiro</span><h3>Mensaje vehiculo listo</h3><p>Podes ajustar el texto y enviarlo directamente.</p></div>
              <textarea rows="4" value={readyMessage} onChange={(event) => setReadyMessage(event.target.value)} aria-label="Mensaje de vehiculo listo" />
              <div className="client-ready-variables"><span>Variables:</span><code>{"{cliente}"}</code><code>{"{vehiculo}"}</code><code>{"{horario}"}</code></div>
              <div className="client-ready-actions">
                {canManageSettings ? <button type="button" onClick={saveReadyMessage} disabled={savingReadyMessage}>{savingReadyMessage ? "Guardando..." : "Guardar plantilla"}</button> : null}
                <a href={readyVehicleWhatsAppLink(selectedClient, readyMessage || settings.readyMessageTemplate, settings.openingHours)} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Enviar vehiculo listo</a>
              </div>
            </section> : null}

            <div className="client-profile-grid">
              <section>
                <h3><Car size={16} /> Vehiculos</h3>
                <div className="client-vehicle-list">
                  {selectedClient.vehicles.map((vehicle) => (
                    <article key={vehicle.id}>
                      <div><strong>{[vehicle.brand, vehicle.model].filter(Boolean).join(" ") || vehicle.type}</strong><small>{[vehicle.license_plate, vehicle.color, vehicle.year].filter(Boolean).join(" · ") || vehicle.type}</small></div>
                      {canManageClients ? <button type="button" onClick={() => handleDeleteVehicle(vehicle.id)} aria-label="Eliminar vehiculo"><Trash2 size={14} /></button> : null}
                    </article>
                  ))}
                </div>
                {canManageClients ? <form className="client-vehicle-form" onSubmit={handleAddVehicle}>
                  <select value={vehicleForm.type} onChange={(event) => setVehicleForm({ ...vehicleForm, type: event.target.value })}><option>Auto</option><option>Camioneta</option><option>SUV</option><option>Moto</option><option>Bicicleta</option></select>
                  <input placeholder="Marca" value={vehicleForm.brand} onChange={(event) => setVehicleForm({ ...vehicleForm, brand: event.target.value })} />
                  <input placeholder="Modelo" value={vehicleForm.model} onChange={(event) => setVehicleForm({ ...vehicleForm, model: event.target.value })} />
                  <input placeholder="Patente" value={vehicleForm.licensePlate} onChange={(event) => setVehicleForm({ ...vehicleForm, licensePlate: event.target.value })} />
                  <input placeholder="Color" value={vehicleForm.color} onChange={(event) => setVehicleForm({ ...vehicleForm, color: event.target.value })} />
                  <input type="number" placeholder="Anio" value={vehicleForm.year} onChange={(event) => setVehicleForm({ ...vehicleForm, year: event.target.value })} />
                  <button type="submit"><Plus size={15} /> Agregar vehiculo</button>
                </form> : null}
              </section>

              <section>
                <h3><History size={16} /> Historial de trabajos</h3>
                <div className="client-history-list">
                  {selectedClient.history.length ? selectedClient.history.map((order) => (
                    <article key={order.id}>
                      <div><strong>#{order.number} · {order.services || "Sin detalle"}</strong><small>{order.date} · {order.status}</small></div>
                      {canManageFinance ? <span><strong>{formatMoney(order.total)}</strong>{order.balance ? <small className="has-balance"><CircleDollarSign size={12} /> Debe {formatMoney(order.balance)}</small> : <small>Pagado</small>}</span> : null}
                    </article>
                  )) : <p>Sin trabajos registrados.</p>}
                </div>
              </section>
            </div>
            {selectedClient.notes ? <p className="client-notes">{selectedClient.notes}</p> : null}
          </section>
          </Modal>
        ) : null}
      </AdminLayout>
    </PageTransition>
  );
}

export default Clients;
