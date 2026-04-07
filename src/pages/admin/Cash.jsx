import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import StatCard from "../../components/ui/StatCard";
import { ArrowDownRight, ArrowUpRight, Plus, Wallet, TrendingUp, TrendingDown, CreditCard, Banknote, Landmark, Edit2, Trash2, X, Calendar, ClipboardList } from "lucide-react";
import { useCash } from "../../hooks/useCash";

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
          <StatCard label="Ingresos Totales" value={formatMoney(incomes)} icon={<TrendingUp size={20} />} color="var(--color-primary)" />
          <StatCard label="Gastos Totales" value={formatMoney(expenses)} icon={<TrendingDown size={20} />} color="#f87171" />
          <StatCard label="Balance Neto" value={formatMoney(balance)} icon={<Wallet size={20} />} color="#38bdf8" />
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", gap: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Calendar size={20} className="text-secondary" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Movimientos Recientes</h2>
          </div>
          <button className={showForm ? "btn-ghost" : "btn-premium"} onClick={() => {
            setShowForm(!showForm);
            if (editingId) {
              setEditingId(null);
              setFormData({ description: "", amount: "", type: "income", method: "Efectivo" });
            }
          }} style={{ minWidth: "220px", justifyContent: "center" }}>
            {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? "Cancelar Registro" : "Registrar Movimiento"}
          </button>
        </div>

        {showForm && (
          <div className="dashboard-panel" style={{ marginBottom: "3rem", animation: "slideDown 0.4s ease-out" }}>
            <h3 style={{ marginBottom: "2rem", fontSize: "1.1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-primary)" }}>
              {editingId ? "Editar Movimiento Contable" : "Nuevo Registro de Caja"}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", alignItems: "end" }}>
              <div className="toolbar-search">
                <label className="toolbar-label"><ClipboardList size={14} /> Concepto / Detalle</label>
                <input type="text" className="admin-input-premium" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ej: Pago de servicios" />
              </div>
              <div className="toolbar-search">
                <label className="toolbar-label"><Wallet size={14} /> Importe ($)</label>
                <input type="number" className="admin-input-premium" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
              </div>
              <div className="toolbar-status">
                <label className="toolbar-label"><TrendingUp size={14} /> Tipo de Flujo</label>
                <select className="admin-input-premium" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="income">Ingreso (+)</option>
                  <option value="expense">Egreso (-)</option>
                </select>
              </div>
              <div className="toolbar-status">
                <label className="toolbar-label"><CreditCard size={14} /> Método</label>
                <select className="admin-input-premium" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                  <option value="Efectivo">Efectivo (Cash)</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta de Crédito</option>
                </select>
              </div>
              <button type="submit" className="btn-premium" style={{ height: "56px", justifyContent: "center" }}>
                {editingId ? "Confirmar Edición" : "Asentar Movimiento"}
              </button>
            </form>
          </div>
        )}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "160px" }}>Fecha Registro</th>
                <th>Concepto y Detalle</th>
                <th>Método Operativo</th>
                <th style={{ textAlign: "right" }}>Monto</th>
                <th style={{ textAlign: "right" }}>Gestión</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td style={{ color: "var(--color-text-soft)", fontWeight: 500 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Calendar size={14} /> {tx.date}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--color-white)" }}>{tx.description}</div>
                  </td>
                  <td>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", background: "rgba(255,255,255,0.03)", padding: "0.4rem 0.8rem", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.05)" }}>
                      {getMethodIcon(tx.method)}
                      {tx.method}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "0.6rem",
                      fontWeight: 900,
                      color: tx.type === "income" ? "var(--color-primary)" : "#f87171",
                      fontSize: "1.1rem",
                      letterSpacing: "-0.01em"
                    }}>
                      {tx.type === "income" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {formatMoney(tx.amount)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
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