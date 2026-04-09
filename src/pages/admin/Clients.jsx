import { useState, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import StatCard from "../../components/ui/StatCard";
import { Search, Plus, Users, Star, TrendingUp, Edit2, Trash2, X, Phone, Car } from "lucide-react";
import { useClients } from "../../hooks/useClients";
import "../../components/admin/TurnsTable.css"; // Usa los estilos premium de las tablas

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
          <StatCard label="Total Clientes" value={totalClients} icon={<Users size={24} />} color="var(--color-primary)"/>
          <StatCard label="Clientes VIP" value={vipClients} icon={<Star size={24} />} trend="+2 este mes" color="#facc15" />
          <StatCard label="Eficiencia" value="94%" icon={<TrendingUp size={24} />} color="#38bdf8" />
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", gap: "2rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-soft)" }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o teléfono..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "1rem 1rem 1rem 3.2rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "var(--color-white)", fontSize: "0.95rem" }}
            />
          </div>
          <button 
            className={showForm ? "btn-ghost" : "btn-premium"} 
            style={{ height: "50px", minWidth: "180px", justifyContent: "center" }}
            onClick={() => {
              setShowForm(!showForm);
              if (editingId) {
                setEditingId(null);
                setFormData({ name: "", phone: "", vehicle: "Auto" });
              }
            }}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            <span>{showForm ? "Cancelar Alta" : "Nuevo Cliente"}</span>
          </button>
        </div>

        {showForm && (
          <div className="inquiry-form-container" style={{ marginBottom: "3rem", padding: "2.5rem", minHeight: "auto", animation: "slideDown 0.4s ease-out" }}>
            <h3 style={{ marginBottom: "2rem", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
              {editingId ? "Editar perfil del cliente" : "Registrar nuevo cliente"}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", alignItems: "end" }}>
              <div className="inquiry-form-group">
                <label><Users size={14} style={{display:'inline', marginRight: '5px'}}/> Nombre Completo</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ej: Roberto Gómez" 
                />
              </div>
              <div className="inquiry-form-group">
                <label><Phone size={14} style={{display:'inline', marginRight: '5px'}}/> Teléfono WhatsApp</label>
                <input 
                  type="text" 
                  required 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  placeholder="Ej: 3814000000" 
                />
              </div>
              <div className="inquiry-form-group">
                <label><Car size={14} style={{display:'inline', marginRight: '5px'}}/> Vehículo Principal</label>
                <select 
                  value={formData.vehicle} 
                  onChange={e => setFormData({...formData, vehicle: e.target.value})}
                >
                  <option value="Auto">Auto Estandar</option>
                  <option value="Camioneta">Camioneta</option>
                  <option value="SUV">SUV</option>
                  <option value="Moto">Motoneta / Moto</option>
                  <option value="Furgón">Furgón utilitario</option>
                </select>
              </div>
              <button type="submit" className="btn-form-primary" style={{ height: "56px", margin: 0 }}>
                {editingId ? "Guardar Cambios" : "Confirmar Alta"}
              </button>
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
                <th>FIDELIDAD</th>
                <th>FLUJO GENERADO</th>
                <th style={{ textAlign: "right" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => {
                const isVip = parseInt(client.visits) >= 3;
                return (
                  <tr key={client.id} className={isVip ? 'row-vip' : ''}>
                    <td>
                      <div className="turn-client-cell">
                        <div className="turn-client-name" style={{ color: "var(--color-white)" }}>
                          {client.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-soft)", fontWeight: 600 }}>ID #{client.id.toString().slice(-4)}</div>
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
                      <div style={{ 
                        display: "inline-flex", alignItems: "center", gap: "0.3rem", fontWeight: 800, padding: "0.3rem 0.6rem", borderRadius: "8px",
                        background: isVip ? "rgba(250, 204, 21, 0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isVip ? "rgba(250, 204, 21, 0.3)" : "rgba(255,255,255,0.05)"}`,
                        color: isVip ? "#facc15" : "var(--color-text-soft)"
                       }}>
                        {isVip && <Star size={12} fill="currentColor" />}
                        {client.visits} {parseInt(client.visits) === 1 ? 'visita' : 'visitas'}
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

          {/* Mobile Card View */}
          <div className="mobile-only-card">
            {clients.map(client => {
              const isVip = parseInt(client.visits) >= 3;
              return (
              <div key={client.id} className={`turn-mobile-card ${isVip ? 'row-vip' : ''}`}>
                <div className="card-header-mobile" style={{ marginBottom: "0.5rem" }}>
                  <div className="date-val-mobile"><Phone size={12} style={{display:'inline'}}/> {client.phone}</div>
                  {isVip && (
                    <div style={{ fontWeight: 800, color: "#facc15", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                      <Star size={12} fill="currentColor"/> VIP
                    </div>
                  )}
                </div>

                <div className="client-info-mini">
                   <strong>{client.name}</strong>
                </div>

                <div className="card-details-grid-mobile" style={{ padding: "0.8rem" }}>
                   <div className="detail-item-mobile">
                     <span className="detail-label">Vehículo</span>
                     <div className="detail-val">{client.vehicle}</div>
                   </div>
                   <div className="detail-item-mobile">
                     <span className="detail-label">Historial</span>
                     <div className="detail-val" style={{ color: isVip ? "#facc15" : "inherit" }}>
                        {client.visits} Visitas
                     </div>
                   </div>
                </div>

                <div className="card-footer-mobile" style={{ paddingTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div>
                     <span style={{ fontSize: "0.7rem", color: "var(--color-text-soft)", textTransform: "uppercase" }}>Acumulado</span>
                     <br/>
                     <strong style={{ fontSize: "1.1rem" }}>{client.amount}</strong>
                   </div>
                   <div className="card-actions-mobile">
                     <button className="btn-ghost-mini" onClick={() => handleEdit(client)}><Edit2 size={16} /></button>
                     <button className="btn-danger-mini" onClick={() => handleDelete(client.id)}><Trash2 size={16} /></button>
                   </div>
                </div>
              </div>
            )})}
          </div>

          {clients.length === 0 && (
            <div style={{ padding: "6rem", textAlign: "center", color: "var(--color-text-soft)" }}>
               <Users size={48} style={{ opacity: 0.2, margin: "0 auto 1rem auto" }} />
               <p style={{ fontStyle: "italic" }}>No se encontraron clientes registrados.</p>
            </div>
          )}
        </div>

      </AdminLayout>
    </PageTransition>
  );
}

export default Clients;