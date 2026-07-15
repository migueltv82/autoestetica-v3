import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import StatCard from "../../components/ui/StatCard";
import { ArrowDownRight, ArrowUpRight, Plus, Wallet, TrendingUp, TrendingDown, CreditCard, Banknote, Landmark, Edit2, Trash2, X, Calendar, ClipboardList } from "lucide-react";
import { useCash } from "../../hooks/useCash";
import "../../components/admin/TurnsTable.css";

function Cash() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useCash();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ description: "", amount: "", type: "income", method: "Efectivo" });

  const incomes = transactions.filter((transaction) => transaction.type === "income").reduce((accumulator, current) => accumulator + current.amount, 0);
  const expenses = transactions.filter((transaction) => transaction.type === "expense").reduce((accumulator, current) => accumulator + current.amount, 0);
  const balance = incomes - expenses;

  const formatMoney = (value) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(value);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.description || !formData.amount) {
      return;
    }

    if (editingId) {
      await updateTransaction(editingId, formData);
      setEditingId(null);
    } else {
      await addTransaction(formData);
    }

    setFormData({ description: "", amount: "", type: "income", method: "Efectivo" });
    setShowForm(false);
  }

  function handleEdit(transaction) {
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      method: transaction.method,
    });
    setEditingId(transaction.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (window.confirm("Queres borrar este movimiento?")) {
      await deleteTransaction(id);
    }
  }

  function getMethodIcon(method) {
    switch (method) {
      case "Efectivo":
        return <Banknote size={16} />;
      case "Transferencia":
        return <Landmark size={16} />;
      case "Tarjeta":
        return <CreditCard size={16} />;
      default:
        return null;
    }
  }

  return (
    <PageTransition>
      <AdminLayout
        title="Control de Caja"
        subtitle="Registro interno de cobros, egresos y movimientos para seguir la salud financiera del negocio."
      >
        <section className="admin-stats-grid">
          <StatCard label="Ingresos totales" value={formatMoney(incomes)} icon={<TrendingUp size={24} />} color="var(--color-primary)" trend="Flujo positivo" />
          <StatCard label="Gastos operativos" value={formatMoney(expenses)} icon={<TrendingDown size={24} />} color="#f87171" trend="Egresos registrados" />
          <StatCard label="Balance neto" value={formatMoney(balance)} icon={<Wallet size={24} />} color="#38bdf8" trend="Resultado actual" />
        </section>

        <AdminPageHeader
          eyebrow="Caja"
          icon={<Wallet size={18} />}
          title="Movimientos de caja"
          subtitle="Registrá lo que entra y sale para conocer el resultado real del negocio."
          actions={
            <button
              className={showForm ? "btn-ghost" : "btn-premium"}
              onClick={() => {
                setShowForm((current) => !current);
                if (editingId) {
                  setEditingId(null);
                  setFormData({ description: "", amount: "", type: "income", method: "Efectivo" });
                }
              }}
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              <span>{showForm ? "Cancelar operacion" : "Asentar movimiento"}</span>
            </button>
          }
        />

        {showForm ? (
          <section className="admin-form-shell">
            <div className="admin-form-header">
              <div>
                <span className="admin-form-kicker">{editingId ? "Edicion" : "Nuevo asiento"}</span>
                <h3 className="admin-form-title">{editingId ? "Editar movimiento contable" : "Nuevo asiento contable"}</h3>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid wide">
                <div className="admin-form-group">
                  <label>
                    <ClipboardList size={14} /> Concepto
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    placeholder="Ej: Pago de insumos"
                  />
                </div>

                <div className="admin-form-group">
                  <label>
                    <Wallet size={14} /> Importe
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(event) => setFormData({ ...formData, amount: event.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="admin-form-group">
                  <label>
                    <TrendingUp size={14} /> Tipo de flujo
                  </label>
                  <select value={formData.type} onChange={(event) => setFormData({ ...formData, type: event.target.value })}>
                    <option value="income">Ingreso (+)</option>
                    <option value="expense">Egreso (-)</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>
                    <CreditCard size={14} /> Medio de pago
                  </label>
                  <select value={formData.method} onChange={(event) => setFormData({ ...formData, method: event.target.value })}>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-actions">
                <button type="submit" className="btn-form-primary">
                  {editingId ? "Confirmar edicion" : "Registrar movimiento"}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <div className="admin-table-wrap">
          <table className="admin-table desktop-only-table">
            <thead>
              <tr>
                <th style={{ width: "160px" }}>Fecha</th>
                <th>Concepto</th>
                <th>Metodo</th>
                <th style={{ textAlign: "right" }}>Monto</th>
                <th style={{ textAlign: "right", width: "100px" }}>Gestion</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className={transaction.type === "income" ? "row-income" : "row-expense"}>
                  <td>
                    <div className="turn-date-val">
                      <Calendar size={14} /> {transaction.date}
                    </div>
                  </td>
                  <td>
                    <div className="turn-client-cell">
                      <div className="turn-client-name">{transaction.description}</div>
                    </div>
                  </td>
                  <td>
                    <div className="vehicle-badge">
                      {getMethodIcon(transaction.method)}
                      {transaction.method}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontWeight: 800,
                        color: transaction.type === "income" ? "var(--color-primary)" : "#f87171",
                        fontSize: "1.15rem",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {transaction.type === "income" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      {formatMoney(transaction.amount)}
                    </div>
                  </td>
                  <td>
                    <div className="turn-actions-cell">
                      <button className="btn-ghost btn-mini-action" onClick={() => handleEdit(transaction)} title="Editar">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-danger btn-mini-action" onClick={() => handleDelete(transaction.id)} title="Borrar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mobile-only-card">
            {transactions.map((transaction) => (
              <div key={transaction.id} className={`turn-mobile-card ${transaction.type === "income" ? "row-income" : "row-expense"}`}>
                <div className="card-header-mobile" style={{ marginBottom: "0.5rem" }}>
                  <div className="date-val-mobile">
                    <Calendar size={12} style={{ display: "inline" }} /> {transaction.date}
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      color: transaction.type === "income" ? "var(--color-primary)" : "#f87171",
                      fontSize: "1.2rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    {transaction.type === "income" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {formatMoney(transaction.amount)}
                  </div>
                </div>
                <div className="client-info-mini">
                  <strong>{transaction.description}</strong>
                </div>
                <div className="card-details-grid-mobile" style={{ padding: "0.8rem" }}>
                  <div className="detail-item-mobile">
                    <span className="detail-label">Metodo</span>
                    <div className="detail-val">
                      {getMethodIcon(transaction.method)} {transaction.method}
                    </div>
                  </div>
                  <div className="detail-item-mobile">
                    <span className="detail-label">Flujo</span>
                    <div className="detail-val" style={{ color: transaction.type === "income" ? "var(--color-primary)" : "#f87171" }}>
                      {transaction.type === "income" ? "Ingreso (+)" : "Egreso (-)"}
                    </div>
                  </div>
                </div>
                <div className="card-footer-mobile" style={{ paddingTop: "0.5rem" }}>
                  <div className="card-actions-mobile">
                    <button className="btn-ghost-mini" onClick={() => handleEdit(transaction)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-danger-mini" onClick={() => handleDelete(transaction.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {transactions.length === 0 ? (
            <div className="admin-empty-state">
              <Wallet size={48} />
              <p>Aun no se registraron movimientos de caja.</p>
            </div>
          ) : null}
        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default Cash;
