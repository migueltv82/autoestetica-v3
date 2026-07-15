import { useState, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import StatCard from "../../components/ui/StatCard";
import { Search, Plus, Users, Star, UserPlus, Edit2, Trash2, X, Phone, Car } from "lucide-react";
import { useClients } from "../../hooks/useClients";
import "../../components/admin/TurnsTable.css";

function Clients() {
  const { clients, totalClients, search, setSearch, addClient, updateClient, deleteClient } = useClients();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "", vehicle: "Auto" });

  const vipClients = useMemo(
    () => clients.filter((client) => Number.parseInt(client.visits, 10) >= 3).length,
    [clients]
  );
  const newThisMonth = useMemo(() => {
    const now = new Date();
    return clients.filter((client) => {
      const created = new Date(client.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
  }, [clients]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!formData.name || !formData.phone) {
      return;
    }

    if (editingId) {
      updateClient(editingId, formData);
      setEditingId(null);
    } else {
      addClient(formData);
    }

    setFormData({ name: "", phone: "", vehicle: "Auto" });
    setShowForm(false);
  }

  function handleEdit(client) {
    setFormData({ name: client.name, phone: client.phone, vehicle: client.vehicle });
    setEditingId(client.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id) {
    if (window.confirm("Queres borrar este cliente? Se perdera todo su historial.")) {
      deleteClient(id);
    }
  }

  return (
    <PageTransition>
      <AdminLayout
        title="Directorio de Clientes"
        subtitle="Historial, datos de contacto y seguimiento comercial en una sola vista."
      >
        <section className="admin-stats-grid">
          <StatCard label="Total clientes" value={totalClients} icon={<Users size={24} />} color="var(--color-primary)" trend="Base activa" />
          <StatCard label="Clientes VIP" value={vipClients} icon={<Star size={24} />} trend="Alta recurrencia" color="#facc15" />
          <StatCard label="Nuevos este mes" value={newThisMonth} icon={<UserPlus size={24} />} trend="Altas registradas" color="#38bdf8" />
        </section>

        <AdminPageHeader
          eyebrow="Clientes"
          icon={<Users size={18} />}
          title="Base de clientes"
          subtitle="Encontrá rápido sus datos, vehículos y trabajos realizados."
          actions={
            <button
              className={showForm ? "btn-ghost" : "btn-premium"}
              onClick={() => {
                setShowForm((current) => !current);
                if (editingId) {
                  setEditingId(null);
                  setFormData({ name: "", phone: "", vehicle: "Auto" });
                }
              }}
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              <span>{showForm ? "Cancelar alta" : "Nuevo cliente"}</span>
            </button>
          }
        />

        <div className="admin-inline-actions">
          <div className="admin-search-shell">
            <Search size={18} className="admin-search-icon" />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Buscar por nombre o telefono..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {showForm ? (
          <section className="admin-form-shell">
            <div className="admin-form-header">
              <div>
                <span className="admin-form-kicker">{editingId ? "Edicion" : "Alta"}</span>
                <h3 className="admin-form-title">
                  {editingId ? "Actualizar perfil del cliente" : "Registrar nuevo cliente"}
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid wide">
                <div className="admin-form-group">
                  <label>
                    <Users size={14} /> Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    placeholder="Ej: Roberto Gomez"
                  />
                </div>

                <div className="admin-form-group">
                  <label>
                    <Phone size={14} /> Telefono WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                    placeholder="Ej: 3814000000"
                  />
                </div>

                <div className="admin-form-group">
                  <label>
                    <Car size={14} /> Vehiculo principal
                  </label>
                  <select
                    value={formData.vehicle}
                    onChange={(event) => setFormData({ ...formData, vehicle: event.target.value })}
                  >
                    <option value="Auto">Auto estandar</option>
                    <option value="Camioneta">Camioneta</option>
                    <option value="SUV">SUV</option>
                    <option value="Moto">Moto</option>
                    <option value="Furgon">Furgon utilitario</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-actions">
                <button type="submit" className="btn-form-primary">
                  {editingId ? "Guardar cambios" : "Confirmar alta"}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <div className="admin-table-wrap">
          <table className="admin-table desktop-only-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Vehiculo</th>
                <th>Fidelidad</th>
                <th>Flujo generado</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const visits = Number.parseInt(client.visits, 10);
                const isVip = visits >= 3;

                return (
                  <tr key={client.id} className={isVip ? "row-vip" : ""}>
                    <td>
                      <div className="turn-client-cell">
                        <div className="turn-client-name">{client.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-soft)", fontWeight: 600 }}>
                          ID #{String(client.id).slice(-4)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--color-white)", fontWeight: 500 }}>
                        <Phone size={14} /> {client.phone}
                      </div>
                    </td>
                    <td>
                      <div className="vehicle-badge">
                        <Car size={14} /> {client.vehicle}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontWeight: 800,
                          padding: "0.3rem 0.6rem",
                          borderRadius: "8px",
                          background: isVip ? "rgba(250, 204, 21, 0.15)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isVip ? "rgba(250, 204, 21, 0.3)" : "rgba(255,255,255,0.05)"}`,
                          color: isVip ? "#facc15" : "var(--color-text-soft)",
                        }}
                      >
                        {isVip ? <Star size={12} fill="currentColor" /> : null}
                        {visits} {visits === 1 ? "visita" : "visitas"}
                      </div>
                    </td>
                    <td style={{ fontWeight: 800, color: "var(--color-white)" }}>{client.amount}</td>
                    <td>
                      <div className="turn-actions-cell" style={{ justifyContent: "flex-end" }}>
                        <button className="btn-ghost btn-mini-action" onClick={() => handleEdit(client)} title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-danger btn-mini-action" onClick={() => handleDelete(client.id)} title="Borrar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mobile-only-card">
            {clients.map((client) => {
              const visits = Number.parseInt(client.visits, 10);
              const isVip = visits >= 3;

              return (
                <div key={client.id} className={`turn-mobile-card ${isVip ? "row-vip" : ""}`}>
                  <div className="card-header-mobile" style={{ marginBottom: "0.5rem" }}>
                    <div className="date-val-mobile">
                      <Phone size={12} style={{ display: "inline" }} /> {client.phone}
                    </div>
                    {isVip ? (
                      <div style={{ fontWeight: 800, color: "#facc15", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <Star size={12} fill="currentColor" /> VIP
                      </div>
                    ) : null}
                  </div>

                  <div className="client-info-mini">
                    <strong>{client.name}</strong>
                  </div>

                  <div className="card-details-grid-mobile" style={{ padding: "0.8rem" }}>
                    <div className="detail-item-mobile">
                      <span className="detail-label">Vehiculo</span>
                      <div className="detail-val">{client.vehicle}</div>
                    </div>
                    <div className="detail-item-mobile">
                      <span className="detail-label">Historial</span>
                      <div className="detail-val" style={{ color: isVip ? "#facc15" : "inherit" }}>
                        {visits} visitas
                      </div>
                    </div>
                  </div>

                  <div className="card-footer-mobile" style={{ paddingTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "var(--color-text-soft)", textTransform: "uppercase" }}>Acumulado</span>
                      <br />
                      <strong style={{ fontSize: "1.1rem" }}>{client.amount}</strong>
                    </div>
                    <div className="card-actions-mobile">
                      <button className="btn-ghost-mini" onClick={() => handleEdit(client)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-danger-mini" onClick={() => handleDelete(client.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {clients.length === 0 ? (
            <div className="admin-empty-state">
              <Users size={48} />
              <p>No se encontraron clientes registrados.</p>
            </div>
          ) : null}
        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default Clients;
