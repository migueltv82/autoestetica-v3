import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import StatCard from "../../components/ui/StatCard";
import { ArrowDownRight, ArrowUpRight, Plus, Wallet, TrendingUp, TrendingDown, CreditCard, Banknote, Landmark, Edit2, Trash2, X, Calendar, ClipboardList } from "lucide-react";
import { useCash } from "../../hooks/useCash";
import "../../components/admin/TurnsTable.css"; // Reuse the premium table styling!

function Cash() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useCash();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ description: "", amount: "", type: "income", method: "Efectivo" });

  const incomes = transactions.filter(t => t.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
  const balance = incomes - expenses;

  const formatMoney = (val) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(val);

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    if (editingId) {
      updateTransaction(editingId, formData);
      setEditingId(null);
    } else {
      addTransaction(formData);
    }

    setFormData({ description: "", amount: "", type: "income", method: "Efectivo" });
    setShowForm(false);
  }

  function handleEdit(tx) {
    setFormData({ description: tx.description, amount: tx.amount, type: tx.type, method: tx.method });
    setEditingId(tx.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    if (window.confirm("¿Seguro que querés borrar este movimiento?")) {
      deleteTransaction(id);
    }
  }

  const getMethodIcon = (method) => {
    switch (method) {
      case "Efectivo": return <Banknote size={16} />;
      case "Transferencia": return <Landmark size={16} />;
      case "Tarjeta": return <CreditCard size={16} />;
      default: return null;
    }
  };

  return (
    <PageTransition>
      <AdminLayout
        title="Control de Caja"
        subtitle="Registro y control interno de cobros, ingresos y movimientos financieros."
      >
        <section className="admin-stats-grid">
          <StatCard label="Ingresos Totales" value={formatMoney(incomes)} icon={<TrendingUp size={24} />} color="var(--color-primary)" />
          <StatCard label="Gastos Operativos" value={formatMoney(expenses)} icon={<TrendingDown size={24} />} color="#f87171" />
          <StatCard label="Balance Efectivo" value={formatMoney(balance)} icon={<Wallet size={24} />} color="#38bdf8" />
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", gap: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Calendar size={20} className="text-secondary" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Libro Mayor</h2>
          </div>
          <button 
            className={showForm ? "btn-ghost" : "btn-premium"} 
            onClick={() => {
              setShowForm(!showForm);
              if (editingId) {
                setEditingId(null);
                setFormData({ description: "", amount: "", type: "income", method: "Efectivo" });
              }
            }} 
            style={{ minWidth: "220px", justifyContent: "center" }}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? "Cancelar Operación" : "Asentar Movimiento"}
          </button>
        </div>

        {showForm && (
          <div className="inquiry-form-container" style={{ marginBottom: "3rem", padding: "2.5rem", minHeight: "auto", animation: "slideDown 0.4s ease-out", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h3 style={{ marginBottom: "2rem", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-primary)" }}>
              {editingId ? "Editar Movimiento Contable" : "Nuevo Asiento Contable"}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", alignItems: "end" }}>
              <div className="inquiry-form-group">
                <label><ClipboardList size={14} style={{display:'inline', marginRight: '5px'}}/> Concepto / Detalle</label>
                <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ej: Pago de insumos 3M" />
              </div>
              <div className="inquiry-form-group">
                <label><Wallet size={14} style={{display:'inline', marginRight: '5px'}}/> Importe ($)</label>
                <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
              </div>
              <div className="inquiry-form-group">
                <label><TrendingUp size={14} style={{display:'inline', marginRight: '5px'}}/> Tipo de Flujo</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="income">Ingreso (+)</option>
                  <option value="expense">Egreso (-)</option>
                </select>
              </div>
              <div className="inquiry-form-group">
                <label><CreditCard size={14} style={{display:'inline', marginRight: '5px'}}/> Medio de Pago</label>
                <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                  <option value="Efectivo">Efectivo Físico</option>
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                </select>
              </div>
              <button type="submit" className="btn-form-primary" style={{ height: "56px", margin: 0 }}>
                {editingId ? "Confirmar Edición" : "Registrar"}
              </button>
            </form>
          </div>
        )}

        <div className="admin-table-wrap">
          <table className="admin-table desktop-only-table">
            <thead>
              <tr>
                <th style={{ width: "160px" }}>Fecha</th>
                <th>Concepto y Detalle</th>
                <th>Método Operativo</th>
                <th style={{ textAlign: "right" }}>Monto</th>
                <th style={{ textAlign: "right", width: "100px" }}>Gestión</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className={tx.type === "income" ? "row-income" : "row-expense"}>
                  <td>
                    <div className="turn-date-val">
                      <Calendar size={14} /> {tx.date}
                    </div>
                  </td>
                  <td>
                    <div className="turn-client-cell">
                      <div className="turn-client-name" style={{ color: "var(--color-white)" }}>{tx.description}</div>
                    </div>
                  </td>
                  <td>
                    <div className="vehicle-badge">
                      {getMethodIcon(tx.method)}
                      {tx.method}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "0.5rem",
                      fontWeight: 800,
                      color: tx.type === "income" ? "var(--color-primary)" : "#f87171",
                      fontSize: "1.15rem",
                      letterSpacing: "-0.01em"
                    }}>
                      {tx.type === "income" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      {formatMoney(tx.amount)}
                    </div>
                  </td>
                  <td>
                    <div className="turn-actions-cell">
                      <button className="btn-ghost btn-mini-action" onClick={() => handleEdit(tx)} title="Editar">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-danger btn-mini-action" onClick={() => handleDelete(tx.id)} title="Borrar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Quick Mobile View for Cash since we replaced the table layout */}
          <div className="mobile-only-card">
            {transactions.map(tx => (
               <div key={tx.id} className={`turn-mobile-card ${tx.type === "income" ? "row-income" : "row-expense"}`}>
                 <div className="card-header-mobile" style={{ marginBottom: "0.5rem" }}>
                   <div className="date-val-mobile"><Calendar size={12} style={{display:'inline'}}/> {tx.date}</div>
                   <div style={{ 
                     fontWeight: 800, 
                     color: tx.type === "income" ? "var(--color-primary)" : "#f87171",
                     fontSize: "1.2rem",
                     display: "flex",
                     alignItems: "center",
                     gap: "0.4rem"
                   }}>
                     {tx.type === "income" ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
                     {formatMoney(tx.amount)}
                   </div>
                 </div>
                 <div className="client-info-mini">
                    <strong>{tx.description}</strong>
                 </div>
                 <div className="card-details-grid-mobile" style={{ padding: "0.8rem" }}>
                    <div className="detail-item-mobile">
                      <span className="detail-label">Método</span>
                      <div className="detail-val">{getMethodIcon(tx.method)} {tx.method}</div>
                    </div>
                    <div className="detail-item-mobile">
                      <span className="detail-label">Flujo</span>
                      <div className="detail-val" style={{ color: tx.type === "income" ? "var(--color-primary)" : "#f87171" }}>
                        {tx.type === "income" ? "Ingreso (+)" : "Egreso (-)"}
                      </div>
                    </div>
                 </div>
                 <div className="card-footer-mobile" style={{ paddingTop: "0.5rem" }}>
                    <div className="card-actions-mobile">
                      <button className="btn-ghost-mini" onClick={() => handleEdit(tx)}><Edit2 size={16} /></button>
                      <button className="btn-danger-mini" onClick={() => handleDelete(tx.id)}><Trash2 size={16} /></button>
                    </div>
                 </div>
               </div>
            ))}
          </div>

          {transactions.length === 0 && (
            <div style={{ padding: "6rem", textAlign: "center", color: "var(--color-text-soft)", fontStyle: "italic" }}>
              Aún no se han registrado movimientos de caja en este período.
            </div>
          )}
        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default Cash;