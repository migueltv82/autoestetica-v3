import { useState, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import StatCard from "../../components/ui/StatCard";
import { Search, Plus, Users, Star, TrendingUp, Edit2, Trash2, X, Phone, Car } from "lucide-react";
import { useClients } from "../../hooks/useClients";

function Clients() {
  const { clients, totalClients, search, setSearch, addClient, updateClient, deleteClient } = useClients();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "", vehicle: "Auto" });

  const vipClients = useMemo(() => clients.filter(c => parseInt(c.visits) >= 3).length, [clients]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    
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
  }

  function handleDelete(id) {
    if (window.confirm("¿Seguro que querés borrar este cliente? Se perderá todo su historial.")) {
      deleteClient(id);
    }
  }

  return (
    <PageTransition>
      <AdminLayout
        title="Directorio de Clientes"
        subtitle="Historial, datos y seguimiento de clientes del negocio."
      >
        <section className="admin-stats-grid">
          <StatCard label="Total Clientes" value={totalClients} icon={<Users size={20} />} />
          <StatCard label="Clientes VIP (+3)" value={vipClients} icon={<Star size={20} />} />
          <StatCard label="Nuevos (Mes)" value="12" icon={<TrendingUp size={20} />} />
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", gap: "1.5rem" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "450px" }}>
            <Search size={18} style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-soft)" }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o teléfono..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: "3.2rem" }}
            />
          </div>
          <button className={showForm ? "btn-ghost" : "btn-premium"} onClick={() => {
            setShowForm(!showForm);
            if (editingId) {
              setEditingId(null);
              setFormData({ name: "", phone: "", vehicle: "Auto" });
            }
          }} style={{ minWidth: "180px", justifyContent: "center" }}>
            {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? "Cancelar" : "Nuevo Cliente"}
          </button>
        </div>

        {showForm && (
          <div className="dashboard-panel" style={{ marginBottom: "3rem" }}>
            <h3 style={{ marginBottom: "2rem", fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary)" }}>
              {editingId ? "Editar perfil del cliente" : "Registrar nuevo cliente"}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", alignItems: "end" }}>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label><Users size={14} /> Nombre Completo</label>
                <input type="text" className="admin-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Roberto Gómez" />
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label><Phone size={14} /> WhatsApp</label>
                <input type="text" className="admin-input" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="381..." />
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label><Car size={14} /> Vehículo Principal</label>
                <select className="admin-input" value={formData.vehicle} onChange={e => setFormData({...formData, vehicle: e.target.value})}>
                  <option value="Auto">Auto</option>
                  <option value="Camioneta">Camioneta</option>
                  <option value="SUV">SUV</option>
                  <option value="Moto">Moto</option>
                  <option value="Bicicleta">Bicicleta</option>
                </select>
              </div>
              <button type="submit" className="btn-premium" style={{ height: "52px", justifyContent: "center" }}>
                {editingId ? "Guardar Cambios" : "Confirmar Registro"}
              </button>
            </form>
          </div>
        )}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>WhatsApp</th>
                <th>Vehículo</th>
                <th style={{ textAlign: "center" }}>Fidelidad</th>
                <th>Gasto Total</th>
                <th style={{ textAlign: "right" }}>Gestión</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(0, 191, 166, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                        <Users size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>{client.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID: #{client.id.toString().slice(-4)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--color-text-soft)", fontWeight: 500 }}>{client.phone}</td>
                  <td>
                    <span className="badge badge-ghost">{client.vehicle}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`badge ${parseInt(client.visits) >= 3 ? 'badge-primary' : 'badge-ghost'}`}>
                      {parseInt(client.visits) >= 3 && <Star size={12} fill="currentColor" />}
                      {client.visits} {parseInt(client.visits) === 1 ? 'visita' : 'visitas'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: "var(--color-white)", fontSize: "1rem" }}>{client.amount}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button className="btn-ghost btn-mini-action" onClick={() => handleEdit(client)} title="Editar">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-danger btn-mini-action" onClick={() => handleDelete(client.id)} title="Borrar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && (
            <div style={{ padding: "6rem", textAlign: "center", color: "var(--color-text-soft)", fontStyle: "italic" }}>
              No se encontraron clientes para la búsqueda actual.
            </div>
          )}
        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default Clients;