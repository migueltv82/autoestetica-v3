import { useState } from "react";
import { Ban, CalendarOff, Plus, Trash2 } from "lucide-react";
import { useScheduleBlocks } from "../../hooks/useScheduleBlocks";
import { useFeedback } from "../../hooks/useFeedback";
import "./ScheduleBlocks.css";

export default function ScheduleBlocks() {
  const { blocks, error, addBlock, deleteBlock } = useScheduleBlocks();
  const { notify, confirm } = useFeedback();
  const [form, setForm] = useState({ date: "", reason: "" });
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!form.date) return notify("Elegí la fecha que querés bloquear.", "error");
    setSaving(true);
    try {
      await addBlock(form);
      setForm({ date: "", reason: "" });
      notify("Día bloqueado en la agenda.", "success");
    } catch (submitError) { notify(submitError.message, "error"); }
    finally { setSaving(false); }
  }

  async function remove(id) {
    if (!await confirm({ title: "Habilitar día", message: "La fecha volverá a estar disponible para nuevos turnos.", confirmLabel: "Habilitar" })) return;
    try { await deleteBlock(id); notify("Día habilitado nuevamente.", "success"); }
    catch (deleteError) { notify(deleteError.message, "error"); }
  }

  return <section className="schedule-blocks dashboard-panel">
    <header><span><CalendarOff size={18} /></span><div><h3>Días no disponibles</h3><p>Bloqueá feriados, vacaciones o días de mantenimiento.</p></div></header>
    <form onSubmit={submit}><input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} /><input type="text" value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Motivo (opcional)" /><button type="submit" disabled={saving}><Plus size={16} /> Bloquear</button></form>
    {error ? <p className="schedule-block-error">Primero ejecutá la migración de disponibilidad en Supabase.</p> : null}
    {blocks.length ? <div className="schedule-block-list">{blocks.map((block) => <article key={block.id}><Ban size={15} /><span><strong>{new Date(block.starts_at).toLocaleDateString("es-AR", { timeZone: "America/Argentina/Tucuman" })}</strong><small>{block.reason}</small></span><button type="button" onClick={() => remove(block.id)} title="Quitar bloqueo"><Trash2 size={15} /></button></article>)}</div> : null}
  </section>;
}

