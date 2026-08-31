import { useCallback, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { FeedbackContext } from "./FeedbackState";
import "./FeedbackContext.css";

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const resolverRef = useRef(null);

  const notify = useCallback((message, type = "info") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  }, []);

  const confirm = useCallback((options) => new Promise((resolve) => {
    resolverRef.current = resolve;
    setConfirmation(typeof options === "string" ? { title: "Confirmar accion", message: options } : options);
  }), []);

  const settleConfirmation = (answer) => {
    resolverRef.current?.(answer);
    resolverRef.current = null;
    setConfirmation(null);
  };

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return <FeedbackContext.Provider value={value}>
    {children}
    <div className="feedback-toasts" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Info;
        return <div className={`feedback-toast ${toast.type}`} key={toast.id}><Icon size={18} /><span>{toast.message}</span><button type="button" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Cerrar"><X size={15} /></button></div>;
      })}
    </div>
    {confirmation ? <div className="feedback-confirm-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) settleConfirmation(false); }}><section className="feedback-confirm" role="alertdialog" aria-modal="true" aria-labelledby="feedback-confirm-title"><div className="feedback-confirm-icon"><AlertTriangle size={22} /></div><div><h2 id="feedback-confirm-title">{confirmation.title || "Confirmar accion"}</h2><p>{confirmation.message}</p></div><div className="feedback-confirm-actions"><button type="button" className="feedback-cancel" onClick={() => settleConfirmation(false)}>Cancelar</button><button type="button" className="feedback-accept" onClick={() => settleConfirmation(true)}>{confirmation.confirmLabel || "Confirmar"}</button></div></section></div> : null}
  </FeedbackContext.Provider>;
}
