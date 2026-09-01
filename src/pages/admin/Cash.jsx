import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Banknote, CircleDollarSign, ClipboardList, CreditCard, Download, Edit2, Landmark, LockKeyhole, Plus, ReceiptText, Trash2, TrendingDown, TrendingUp, Wallet, X } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import StatCard from "../../components/ui/StatCard";
import ReceiptModal from "../../components/admin/ReceiptModal";
import EmptyState from "../../components/ui/EmptyState";
import CashMovementsSkeleton from "../../components/admin/CashMovementsSkeleton";
import { useCash } from "../../hooks/useCash";
import { useFeedback } from "../../hooks/useFeedback";
import { useSettings } from "../../hooks/useSettings";
import { useServices } from "../../hooks/useServices";
import "./Cash.css";

const EMPTY_MOVEMENT = { description: "", amount: "", type: "income", method: "Efectivo", category: "Servicios", date: "" };
const METHODS = ["Efectivo", "Transferencia", "Tarjeta", "Débito", "Crédito", "Billetera virtual"];
const money = (value) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value || 0);

function MethodIcon({ method }) { if (method === "Efectivo") return <Banknote size={15} />; if (method === "Transferencia") return <Landmark size={15} />; return <CreditCard size={15} />; }

function Cash() {
  const { transactions, receivables, closures, receipts, isLoading, error, addTransaction, updateTransaction, deleteTransaction, collectPayment, updateReceipt, voidReceipt, closeDay } = useCash();
  const { settings } = useSettings();
  const { services } = useServices();
  const { confirm, notify } = useFeedback();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_MOVEMENT);
  const [paymentForm, setPaymentForm] = useState(null);
  const [receiptTurn, setReceiptTurn] = useState(null);
  const [closing, setClosing] = useState(false);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Tucuman" });
  const [period, setPeriod] = useState({ from: `${today.slice(0, 8)}01`, to: today });

  const filteredTransactions = useMemo(() => transactions.filter((item) => (!period.from || item.date >= period.from) && (!period.to || item.date <= period.to)), [transactions, period]);
  const incomes = filteredTransactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = filteredTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const outstanding = receivables.reduce((sum, order) => sum + order.balance, 0);
  const isClosedToday = closures.some((closure) => closure.closure_date === today);
  const methodTotals = useMemo(() => METHODS.map((method) => ({ method, amount: filteredTransactions.filter((item) => item.type === "income" && item.method === method).reduce((sum, item) => sum + item.amount, 0) })), [filteredTransactions]);

  function resetMovement() { setFormData(EMPTY_MOVEMENT); setEditingId(null); setShowForm(false); }
  async function handleSubmit(event) { event.preventDefault(); if (!formData.description.trim() || !formData.category.trim() || !formData.date || Number(formData.amount) <= 0) return notify("Completá fecha, concepto, categoría e importe.", "error"); try { if (editingId) { await updateTransaction(editingId, formData); notify("Movimiento actualizado.", "success"); } else { await addTransaction(formData); notify("Movimiento registrado.", "success"); } resetMovement(); } catch (saveError) { notify(saveError.message || "No se pudo guardar el movimiento.", "error"); } }
  function openNewMovement() { setFormData({ ...EMPTY_MOVEMENT, date: today }); setEditingId(null); setShowForm(true); }
  function handleEdit(item) { setFormData({ description: item.description, amount: item.amount, type: item.type, method: item.method, category: item.category || "", date: item.date }); setEditingId(item.id); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
  async function handleDelete(id) { if (!await confirm({ title: "Eliminar movimiento", message: "El movimiento será anulado y dejará de incluirse en los totales de Caja.", confirmLabel: "Eliminar" })) return; try { await deleteTransaction(id); notify("Movimiento eliminado.", "success"); } catch (deleteError) { notify(deleteError.message || "No se pudo eliminar el movimiento.", "error"); } }
  async function handleDeleteReceipt() { if (!receiptTurn || !await confirm({ title: "Eliminar recibo", message: "El recibo se anulará y dejará de aparecer en Caja. El turno y los movimientos asociados se conservarán.", confirmLabel: "Eliminar recibo" })) return; try { await voidReceipt(receiptTurn.receiptId); setReceiptTurn(null); notify("Recibo eliminado.", "success"); } catch (deleteError) { notify(deleteError.message || "No se pudo eliminar el recibo.", "error"); } }
  async function handleCollect(event) { event.preventDefault(); try { await collectPayment(paymentForm.order, paymentForm.amount, paymentForm.method); notify("Cobro registrado y saldo actualizado.", "success"); setPaymentForm(null); } catch (paymentError) { notify(paymentError.message, "error"); } }
  function exportCsv() { const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`; const rows = [["Fecha", "Tipo", "Categoría", "Descripción", "Método", "Monto"], ...filteredTransactions.map((item) => [item.date, item.type === "income" ? "Ingreso" : "Egreso", item.category, item.description, item.method, item.amount])]; const blob = new Blob(["\uFEFF" + rows.map((row) => row.map(escape).join(";")).join("\n")], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `caja-${period.from}-${period.to}.csv`; link.click(); URL.revokeObjectURL(url); }
  async function handleCloseToday() { const items = transactions.filter((item) => item.date === today); const dayIncome = items.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0); const dayExpenses = items.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0); if (!items.length) return notify("No hay movimientos para cerrar hoy.", "error"); if (!await confirm({ title: "Cerrar caja del día", message: `Se guardará un cierre con ${items.length} movimientos y un saldo de ${money(dayIncome - dayExpenses)}.`, confirmLabel: "Cerrar caja" })) return; setClosing(true); try { await closeDay({ date: today, incomes: dayIncome, expenses: dayExpenses, count: items.length }); notify("Cierre diario registrado.", "success"); } catch (closeError) { notify(closeError.message, "error"); } finally { setClosing(false); } }

  return <PageTransition><AdminLayout title="Control de caja" subtitle="Cobros, gastos, saldos y recibos del negocio.">
    <section className="admin-stats-grid cash-stats"><StatCard label="Ingresos" value={money(incomes)} icon={<TrendingUp size={22} />} color="#4ade80" trend="Período seleccionado" /><StatCard label="Gastos" value={money(expenses)} icon={<TrendingDown size={22} />} color="#f87171" trend="Período seleccionado" /><StatCard label="Balance neto" value={money(incomes - expenses)} icon={<Wallet size={22} />} color="#38bdf8" trend="Resultado actual" /><StatCard label="Por cobrar" value={money(outstanding)} icon={<CircleDollarSign size={22} />} color="#fbbf24" trend={`${receivables.length} órdenes con saldo`} /></section>

    <section className="cash-controls"><div className="cash-dates"><label>Desde<input type="date" value={period.from} onChange={(event) => setPeriod((current) => ({ ...current, from: event.target.value }))} /></label><label>Hasta<input type="date" value={period.to} onChange={(event) => setPeriod((current) => ({ ...current, to: event.target.value }))} /></label></div><div className="cash-control-actions"><button type="button" onClick={exportCsv} disabled={!filteredTransactions.length}><Download size={16} /> Exportar CSV</button><button type="button" className="cash-close-button" onClick={handleCloseToday} disabled={closing || isClosedToday}><LockKeyhole size={16} />{isClosedToday ? "Caja cerrada hoy" : closing ? "Cerrando…" : "Cerrar caja de hoy"}</button></div></section>
    {error ? <div className="cash-error" role="alert">No pudimos actualizar todos los datos de Caja.</div> : null}

    <section className="cash-methods"><header><div><span className="admin-form-kicker">Distribución</span><h3>Ingresos por medio de pago</h3></div><small>{period.from} al {period.to}</small></header><div>{methodTotals.map(({ method, amount }) => <article key={method}><span><MethodIcon method={method} /> {method}</span><strong>{money(amount)}</strong></article>)}</div></section>

    <div className="cash-operation-grid"><section className="cash-panel"><header><div><span className="admin-form-kicker">Cuentas por cobrar</span><h3>Saldos pendientes</h3><p>Señas, pagos parciales y cancelaciones de saldo.</p></div><strong className="cash-outstanding">{money(outstanding)}</strong></header>{receivables.length ? <div className="cash-operation-list">{receivables.map((order) => <article key={order.id}><div><strong>{order.client}</strong><small>Orden #{order.number} · {order.vehicle} · {order.date}</small></div><span><small>Pagó {money(order.paid)} de {money(order.total)}</small><strong>{money(order.balance)}</strong></span><button type="button" onClick={() => setPaymentForm({ order, amount: order.balance, method: "Efectivo" })}><CircleDollarSign size={15} /> Cobrar</button></article>)}</div> : <div className="cash-empty-small">No hay saldos pendientes.</div>}</section>
      <section className="cash-panel"><header><div><span className="admin-form-kicker">Recibos</span><h3>Listos para compartir</h3><p>Revisá el detalle y envialo por WhatsApp.</p></div><strong>{receipts.length}</strong></header>{receipts.length ? <div className="cash-operation-list">{receipts.slice(0, 10).map((receipt) => <article key={receipt.receiptId}><div><strong>#{receipt.receiptNumber} · {receipt.client}</strong><small>{receipt.date} · {receipt.vehicle} · {receipt.service}</small></div><span><small>{receipt.paymentStatus === "paid" ? "Pagado" : receipt.paymentStatus === "partial" ? "Pago parcial" : "Pendiente"}</small><strong>{money(receipt.amount)}</strong></span><button type="button" onClick={() => setReceiptTurn(receipt)}><ReceiptText size={15} /> Ver recibo</button></article>)}</div> : <div className="cash-empty-small">Todavía no hay recibos.</div>}</section></div>

    {paymentForm ? <section className="cash-inline-form admin-form-shell"><div className="admin-form-header"><div><span className="admin-form-kicker">Registrar cobro</span><h3 className="admin-form-title">{paymentForm.order.client} · Saldo {money(paymentForm.order.balance)}</h3></div><button type="button" className="btn-ghost" onClick={() => setPaymentForm(null)} aria-label="Cancelar cobro"><X size={17} /></button></div><form onSubmit={handleCollect}><div className="admin-form-grid wide"><div className="admin-form-group"><label>Importe</label><input type="number" min="1" max={paymentForm.order.balance} value={paymentForm.amount} onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))} required /></div><div className="admin-form-group"><label>Medio de pago</label><select value={paymentForm.method} onChange={(event) => setPaymentForm((current) => ({ ...current, method: event.target.value }))}>{METHODS.filter((method) => method !== "Tarjeta").map((method) => <option key={method}>{method}</option>)}</select></div></div><div className="admin-form-actions"><button type="submit" className="btn-form-primary">Confirmar cobro</button></div></form></section> : null}

    <AdminPageHeader eyebrow="Caja" icon={<Wallet size={18} />} title="Movimientos" subtitle="Todo lo que entra y sale durante el período seleccionado." actions={<button type="button" className={showForm ? "btn-ghost" : "btn-premium"} onClick={() => showForm ? resetMovement() : openNewMovement()}>{showForm ? <X size={18} /> : <Plus size={18} />}<span>{showForm ? "Cancelar" : "Nuevo movimiento"}</span></button>} />
    {showForm ? <section className="cash-inline-form admin-form-shell"><div className="admin-form-header"><div><span className="admin-form-kicker">{editingId ? "Edición" : "Nuevo asiento"}</span><h3 className="admin-form-title">{editingId ? "Editar movimiento" : "Registrar movimiento"}</h3></div></div><form onSubmit={handleSubmit}><div className="admin-form-grid wide"><div className="admin-form-group"><label><ClipboardList size={14} /> Concepto *</label><input required value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} placeholder="Ej: Compra de insumos" /></div><div className="admin-form-group"><label><Wallet size={14} /> Importe *</label><input type="number" min="1" required value={formData.amount} onChange={(event) => setFormData({ ...formData, amount: event.target.value })} placeholder="0" /></div><div className="admin-form-group"><label>Fecha *</label><input type="date" required value={formData.date} onChange={(event) => setFormData({ ...formData, date: event.target.value })} /></div><div className="admin-form-group"><label>Categoría *</label><input required value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })} placeholder="Ej: Insumos" /></div><div className="admin-form-group"><label>Tipo</label><select value={formData.type} onChange={(event) => setFormData({ ...formData, type: event.target.value })}><option value="income">Ingreso (+)</option><option value="expense">Egreso (-)</option></select></div><div className="admin-form-group"><label>Medio de pago</label><select value={formData.method} onChange={(event) => setFormData({ ...formData, method: event.target.value })}>{METHODS.map((method) => <option key={method}>{method}</option>)}</select></div></div><div className="admin-form-actions"><button type="submit" className="btn-form-primary">{editingId ? "Guardar cambios" : "Registrar movimiento"}</button></div></form></section> : null}

    {!isLoading && filteredTransactions.length ? <section className="cash-movement-list" aria-label="Movimientos de caja">{filteredTransactions.map((item) => <article key={item.id} className={item.type}><span className="cash-flow-icon">{item.type === "income" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}</span><div className="cash-movement-main"><strong>{item.description}</strong><small>{item.date} · {item.category || "Sin categoría"}</small></div><span className="cash-method"><MethodIcon method={item.method} /> {item.method}</span><strong className="cash-amount">{item.type === "income" ? "+" : "−"}{money(item.amount)}</strong><div className="cash-row-actions"><button type="button" onClick={() => handleEdit(item)} aria-label="Editar movimiento"><Edit2 size={15} /></button><button type="button" className="danger" onClick={() => handleDelete(item.id)} aria-label="Eliminar movimiento"><Trash2 size={15} /></button></div></article>)}</section> : null}
    {isLoading ? <CashMovementsSkeleton /> : null}
    {!isLoading && !filteredTransactions.length ? (
      <EmptyState
        icon={<Wallet size={32} />}
        title="Sin movimientos en este período"
        text="Cambiá las fechas o registrá un nuevo movimiento."
        action={<button type="button" className="btn-premium" onClick={openNewMovement}><Plus size={16} /> <span>Nuevo movimiento</span></button>}
      />
    ) : null}
  </AdminLayout>{receiptTurn ? <ReceiptModal turn={receiptTurn} services={services} settings={settings} onClose={() => setReceiptTurn(null)} onSave={(items) => updateReceipt(receiptTurn.receiptId, items)} onDelete={handleDeleteReceipt} /> : null}</PageTransition>;
}
export default Cash;
