import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import TurnsTableSkeleton from "../../components/admin/TurnsTableSkeleton";
import TurnForm from "../../components/admin/TurnForm";
import ReceiptModal from "../../components/admin/ReceiptModal";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { useTurns } from "../../hooks/useTurns";
import { useServices } from "../../hooks/useServices";
import { useSettings } from "../../hooks/useSettings";
import { usePermissions } from "../../hooks/usePermissions";
import { Calendar, CalendarDays, CalendarRange, ListChecks, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SimpleAgenda from "../../components/admin/SimpleAgenda";
import { useFeedback } from "../../hooks/useFeedback";
import { getTodayString } from "../../utils/date";
import { fidelityProgressWhatsAppLink, fidelityWelcomeWhatsAppLink } from "../../utils/whatsapp";
import { MonthAgenda, WeekAgenda } from "../../components/admin/AgendaViews";
import "./Turns.css";

function Turns() {
  const { confirm, notify } = useFeedback();
  const {
    turns,
    isLoading,
    addTurn,
    updateTurn,
    updateTurnStatus: saveTurnStatus,
    deleteTurn,
  } = useTurns();

  const { services } = useServices();
  const { settings } = useSettings();
  const { canManageTurns, canManageFinance, canDeleteTurns } = usePermissions();

  const [showForm, setShowForm] = useState(false);
  const [editingTurn, setEditingTurn] = useState(null);
  const [receiptTurn, setReceiptTurn] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [agendaView, setAgendaView] = useState("day");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const inquiryId = searchParams.get("agendar");
    if (!inquiryId || !turns.length) return;
    const inquiry = turns.find((turn) => turn.id === inquiryId && turn.status === "Consulta");
    const timer = setTimeout(() => {
      if (inquiry) {
        setEditingTurn(inquiry);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setSearchParams({}, { replace: true });
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams, setSearchParams, turns]);

  const handleCreateTurn = async (formData) => {
    try {
      await addTurn(formData);
      setShowForm(false);
      setSelectedDate(formData.date);
      setAgendaView("day");
      notify("Turno guardado. Podés enviar la confirmación desde la agenda.", "success");
    } catch (error) {
      console.error(error);
      notify(error?.message || "No se pudo guardar la orden. Revisa los datos e intenta nuevamente.", "error");
      throw error;
    }
  };

  const handleUpdateTurn = async (formData) => {
    try {
      const wasInquiry = editingTurn.status === "Consulta";
      await updateTurn(editingTurn.id, formData);
      setEditingTurn(null);
      setShowForm(false);
      if (wasInquiry) {
        setSelectedDate(formData.date);
        setAgendaView("day");
      }
      notify(wasInquiry ? "Consulta agregada a la agenda. Ya podés preparar la confirmación." : "Cambios del turno guardados.", "success");
    } catch (error) {
      console.error(error);
      notify(error?.message || "No se pudieron guardar los cambios del turno.", "error");
      throw error;
    }
  };

  const openEdit = (turn) => {
    setEditingTurn(turn);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateTurnStatus = async (turnId, nextStatus) => {
    const turn = turns.find((item) => item.id === turnId);
    try {
      const fidelityResult = await saveTurnStatus(turnId, nextStatus);
      if (!turn?.phone || !fidelityResult?.card) return;
      if (nextStatus === "Confirmado") {
        const accepted = await confirm({
          title: "Enviar confirmación y tarjeta",
          message: `El turno de ${turn.client} quedó confirmado y su tarjeta está lista. ¿Querés abrir WhatsApp para enviarle ambos?`,
          confirmLabel: "Abrir WhatsApp",
        });
        if (accepted) window.open(fidelityWelcomeWhatsAppLink(turn, settings.businessName), "_blank", "noopener,noreferrer");
      }
      if (nextStatus === "Finalizado" && !fidelityResult.alreadyUnlocked) {
        const accepted = await confirm({
          title: "Enviar tarjeta actualizada",
          message: `El trabajo de ${turn.client} quedó finalizado y se agregó el troquel ${fidelityResult.card.stampsCount}/4. ¿Querés enviarle la tarjeta por WhatsApp?`,
          confirmLabel: "Abrir WhatsApp",
        });
        if (accepted) window.open(fidelityProgressWhatsAppLink(turn, fidelityResult.card.stampsCount, settings.businessName), "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      notify(error?.message || "No se pudo actualizar el estado del turno.", "error");
    }
  };

  return (
    <PageTransition>
      <AdminLayout>
        <AdminPageHeader
          eyebrow="Agenda"
          icon={<Calendar size={18} />}
          title="Agenda de turnos"
          subtitle="Organizá los trabajos del día y mantené cada cliente al tanto."
          actions={canManageTurns ? (
            <button className={showForm ? "btn-form-primary" : "btn-primary-admin"} onClick={() => { setEditingTurn(null); setShowForm((current) => !current); }}>
              {showForm ? <X size={18} /> : <Plus size={18} />}
              <span>{showForm ? "Cerrar" : "Nuevo Turno"}</span>
            </button>
          ) : null}
        />

        {showForm && canManageTurns ? (
          <TurnForm key={editingTurn?.id || "new"} initialData={editingTurn} onAddTurn={editingTurn ? handleUpdateTurn : handleCreateTurn} />
        ) : null}

        <div className="simple-agenda-view-tabs" role="tablist" aria-label="Vista de agenda">
          <button type="button" className={agendaView === "day" ? "active" : ""} onClick={() => setAgendaView("day")}><ListChecks size={17} /> Día</button>
          <button type="button" className={agendaView === "week" ? "active" : ""} onClick={() => setAgendaView("week")}><CalendarRange size={17} /> Semana</button>
          <button type="button" className={agendaView === "month" ? "active" : ""} onClick={() => setAgendaView("month")}><CalendarDays size={17} /> Mes</button>
        </div>

        {isLoading ? <TurnsTableSkeleton /> : agendaView === "day" ? <SimpleAgenda turns={turns} selectedDate={selectedDate} onDateChange={setSelectedDate} search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} onStatusChange={canManageTurns ? updateTurnStatus : null} onDeleteTurn={canDeleteTurns ? deleteTurn : null} onGenerateReceipt={canManageFinance ? setReceiptTurn : null} onEditTurn={canManageTurns ? openEdit : null} settings={settings} canUseOperationalActions={canManageTurns} /> : agendaView === "week" ? <WeekAgenda turns={turns} weekOffset={weekOffset} onWeekChange={setWeekOffset} onStatusChange={canManageTurns ? updateTurnStatus : null} onEditTurn={canManageTurns ? openEdit : null} onDeleteTurn={canDeleteTurns ? deleteTurn : null} settings={settings} canUseOperationalActions={canManageTurns} /> : <MonthAgenda turns={turns} monthOffset={monthOffset} onMonthChange={setMonthOffset} onStatusChange={canManageTurns ? updateTurnStatus : null} onEditTurn={canManageTurns ? openEdit : null} onDeleteTurn={canDeleteTurns ? deleteTurn : null} settings={settings} canUseOperationalActions={canManageTurns} />}
        {receiptTurn ? (
          <ReceiptModal
            turn={receiptTurn}
            services={services}
            settings={settings}
            onClose={() => setReceiptTurn(null)}
          />
        ) : null}
      </AdminLayout>
    </PageTransition>
  );
}

export default Turns;
