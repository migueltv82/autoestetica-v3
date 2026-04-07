import { useState, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import StatCard from "../../components/ui/StatCard";
import { Search, Plus, Users, Star, TrendingUp, Edit2, Trash2, X, Phone, Car } from "lucide-react";
import { useClients } from "../../hooks/useClients";
import "./Clients.css";

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <StatCard label="Clientes VIP (+3)" value={vipClients} icon={<Star size={20} />} trend="+2 este mes" />
          <StatCard label="Eficiencia" value="94%" icon={<TrendingUp size={20} />} />
        </section>

        <div className="clients-toolbar">
          <div className="clients-search-container">
            <Search size={18} className="clients-search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o teléfono..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
              style={{ paddingLeft: "3.2rem" }}
            />
          </div>
          <button 
            className={showForm ? "btn-ghost" : "btn-premium"} 
            onClick={() => {
              setShowForm(!showForm);
              if (editingId) {
                setEditingId(null);
                setFormData({ name: "", phone: "", vehicle: "Auto" });
              }
            }}
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            <span>{showForm ? "Cerrar" : "Nuevo Cliente"}</span>
          </button>
        </div>

        {showForm && (
          <div className="dashboard-panel clients-form-panel">
            <h3 className="clients-form-title">
              {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
              {editingId ? "Editar perfil del cliente" : "Registrar nuevo cliente"}
            </h3>
            <form onSubmit={handleSubmit} className="clients-form-grid">
              <div className="admin-form-group">
                <label><Users size={14} /> NOMBRE COMPLETO</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ej: Roberto Gómez" 
                />
              </div>
              <div className="admin-form-group">
                <label><Phone size={14} /> WHATSAPP</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  required 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  placeholder="381..." 
                />
              </div>
              <div className="admin-form-group">
                <label><Car size={14} /> VEHÍCULO PRINCIPAL</label>
                <select 
                  className="admin-input" 
                  value={formData.vehicle} 
                  onChange={e => setFormData({...formData, vehicle: e.target.value})}
                >
                  <option value="Auto">Auto</option>
                  <option value="Camioneta">Camioneta</option>
                  <option value="SUV">SUV</option>
                  <option value="Moto">Moto</option>
                  <option value="Furgón">Furgón</option>
                </select>
              </div>
              <div className="clients-form-actions">
                <button type="submit" className="btn-premium full-width-mobile">
                  {editingId ? "Guardar Cambios" : "Confirmar Alta"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="admin-table-wrap">
          {/* Desktop Table View */}
          <table className="admin-table desktop-only-table">
            <thead>
              <tr>
                <th>CLIENTE</th>
                <th>CONTACTO</th>
                <th>VEHÍCULO</th>
                <th style={{ textAlign: "center" }}>FIDELIDAD</th>
                <th>FLUJO TOTAL</th>
                <th style={{ textAlign: "right" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td>
                    <div className="client-item-info">
                      <div className="client-avatar">
                        <Users size={22} />
                      </div>
                      <div className="client-name-box">
                        <div className="client-name">{client.name}</div>
                        <div className="client-id">ID #{client.id.toString().slice(-4)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="client-phone">{client.phone}</td>
                  <td>
                    <span className="badge badge-ghost">{client.vehicle}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`badge ${parseInt(client.visits) >= 3 ? 'badge-primary' : 'badge-ghost'}`}>
                      {parseInt(client.visits) >= 3 && <Star size={13} fill="currentColor" style={{ marginRight: "4px" }} />}
                      {client.visits} {parseInt(client.visits) === 1 ? 'visita' : 'visitas'}
                    </span>
                  </td>
                  <td className="client-amount">{client.amount}</td>
                  <td>
                    <div className="turn-actions-cell">
                      <button className="btn-ghost btn-mini-action" onClick={() => handleEdit(client)} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-danger btn-mini-action" onClick={() => handleDelete(client.id)} title="Borrar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="mobile-only-card clients-mobile-grid">
            {clients.map(client => (
              <div key={client.id} className="client-mobile-card">
                <div className="client-card-header">
                  <div className="client-card-avatar">{client.name.charAt(0)}</div>
                  <div className="client-card-main">
                    <strong>{client.name}</strong>
                    <span>{client.phone}</span>
                  </div>
                  <div className={`badge-vip ${parseInt(client.visits) >= 3 ? 'active' : ''}`}>
                    <Star size={14} fill={parseInt(client.visits) >= 3 ? "currentColor" : "none"} />
                  </div>
                </div>

                <div className="client-card-details">
                  <div className="client-detail">
                    <span className="detail-label">Vehículo</span>
                    <span className="detail-val">{client.vehicle}</span>
                  </div>
                  <div className="client-detail">
                    <span className="detail-label">Visitas</span>
                    <span className="detail-val">{client.visits} acumuladas</span>
                  </div>
                </div>

                <div className="client-card-amount">
                  <span className="amount-label">Flujo Total Generado</span>
                  <span className="amount-val">{client.amount}</span>
                </div>

                <div className="client-card-actions">
                  <button className="btn-ghost-mini" onClick={() => handleEdit(client)}><Edit2 size={18} /></button>
                  <button className="btn-danger-mini" onClick={() => handleDelete(client.id)}><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>

          {clients.length === 0 && (
            <div className="empty-clients-state">
               <Users size={48} className="empty-clients-icon" />
               <p>No se encontraron clientes registrados.</p>
            </div>
          )}
        </div>

      </AdminLayout>
    </PageTransition>
  );
}

export default Clients;