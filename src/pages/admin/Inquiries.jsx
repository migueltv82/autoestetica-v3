import { CalendarPlus, Car, CheckCheck, Mail, MessageCircle, MessageSquareText, Phone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import PageTransition from "../../components/ui/PageTransition";
import { useTurns } from "../../hooks/useTurns";
import { useSettings } from "../../hooks/useSettings";
import { useFeedback } from "../../hooks/useFeedback";
import { inquiryReplyWhatsAppLink } from "../../utils/whatsapp";
import { markInquiryAsRead } from "../../services/turnsApi";
import "./Inquiries.css";

export default function Inquiries() {
  const { turns, isLoading, refresh } = useTurns();
  const { settings } = useSettings();
  const { notify } = useFeedback();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const allInquiries = turns.filter((turn) => turn.status === "Consulta").slice().reverse();
  const unreadCount = allInquiries.filter((inquiry) => !inquiry.inquiryReadAt).length;
  const inquiries = allInquiries.filter((inquiry) => filter === "all" || (filter === "new" ? !inquiry.inquiryReadAt : inquiry.inquiryReadAt));

  async function markRead(inquiry, { silent = false } = {}) {
    if (inquiry.inquiryReadAt) return true;
    try {
      await markInquiryAsRead(inquiry.id);
      await refresh({ silent: true });
      if (!silent) notify("Consulta marcada como leída.", "success");
      return true;
    } catch (error) {
      notify(error?.message || "No se pudo actualizar la consulta.", "error");
      return false;
    }
  }

  async function scheduleInquiry(inquiry) {
    const marked = await markRead(inquiry, { silent: true });
    if (marked) navigate(`/admin/turnos?agendar=${inquiry.id}`);
  }

  return (
    <PageTransition>
      <AdminLayout>
        <AdminPageHeader eyebrow="Mensajes" icon={<MessageSquareText size={18} />} title="Consultas recibidas" subtitle="Mensajes enviados desde el formulario público, listos para responder o convertir en turno." />

        <div className="inquiry-filters" role="group" aria-label="Filtrar consultas">
          <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todas <strong>{allInquiries.length}</strong></button>
          <button type="button" className={filter === "new" ? "active" : ""} onClick={() => setFilter("new")}>Nuevas <strong>{unreadCount}</strong></button>
          <button type="button" className={filter === "read" ? "active" : ""} onClick={() => setFilter("read")}>Leídas <strong>{allInquiries.length - unreadCount}</strong></button>
        </div>

        {isLoading ? <div className="inquiries-empty">Cargando consultas…</div> : null}
        {!isLoading && !inquiries.length ? <div className="inquiries-empty"><MessageSquareText size={34} /><strong>No hay consultas en esta categoría</strong><span>Las nuevas consultas del sitio aparecerán automáticamente acá.</span></div> : null}

        <div className="inquiries-grid">
          {inquiries.map((inquiry) => (
            <article className={`inquiry-admin-card ${inquiry.inquiryReadAt ? "is-read" : "is-new"}`} key={inquiry.id}>
              <header><div><span>Consulta #{inquiry.number}</span><h3>{inquiry.client}</h3></div><span className="inquiry-status">{inquiry.inquiryReadAt ? <><CheckCheck size={13} /> Leída</> : <><Mail size={13} /> Nueva</>}</span></header>
              <div className="inquiry-admin-meta"><span><Phone size={14} />{inquiry.phone}</span><span><Car size={14} />{[inquiry.vehicle, inquiry.vehicleBrand, inquiry.vehicleModel].filter(Boolean).join(" · ")}</span></div>
              <div className="inquiry-admin-services"><small>Servicios consultados</small><strong>{inquiry.service}</strong></div>
              <div className="inquiry-admin-message"><small>Mensaje del cliente</small><p>{inquiry.notes?.split("\nAceptó Política")[0] || "Sin detalle adicional."}</p></div>
              <footer>
                <a href={inquiryReplyWhatsAppLink(inquiry, settings?.businessName)} target="_blank" rel="noreferrer" onClick={() => markRead(inquiry, { silent: true })}><MessageCircle size={16} /> Responder por WhatsApp</a>
                <button type="button" onClick={() => scheduleInquiry(inquiry)}><CalendarPlus size={16} /> Agendar turno</button>
                {!inquiry.inquiryReadAt ? <button type="button" className="inquiry-mark-read" onClick={() => markRead(inquiry)}><CheckCheck size={16} /> Marcar como leída</button> : null}
              </footer>
            </article>
          ))}
        </div>
      </AdminLayout>
    </PageTransition>
  );
}
