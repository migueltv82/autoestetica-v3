import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import TurnsToolbar from "../../components/admin/TurnsToolbar";
import TurnsTableSkeleton from "../../components/admin/TurnsTableSkeleton";
import TurnForm from "../../components/admin/TurnForm";
import ReceiptModal from "../../components/admin/ReceiptModal";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { useTurns } from "../../hooks/useTurns";
import { useServices } from "../../hooks/useServices";
import { useSettings } from "../../hooks/useSettings";
import { Calendar, CalendarRange, Columns3, ListChecks, Plus, X } from "lucide-react";
import { useState } from "react";
import { BoardAgenda, TodayAgenda, WeekAgenda } from "../../components/admin/AgendaViews";

function Turns() {
  const {
    filteredTurns,
    filters,
    isLoading,
    addTurn,
    updateTurn,
    handleFilterChange,
    clearFilters,
    updateTurnStatus,
    deleteTurn,
  } = useTurns();

  const { services } = useServices();
  const { settings } = useSettings();

  const [showForm, setShowForm] = useState(false);
  const [editingTurn, setEditingTurn] = useState(null);
  const [receiptTurn, setReceiptTurn] = useState(null);
  const [agendaView, setAgendaView] = useState("today");
  const [weekOffset, setWeekOffset] = useState(0);

  const handleCreateTurn = async (formData) => {
    try {
      await addTurn(formData);
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar la orden. Revisá los datos e intentá nuevamente.");
      throw error;
    }
  };

  const handleUpdateTurn = async (formData) => {
    try {
      await updateTurn(editingTurn.id, formData);
      setEditingTurn(null);
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert("No se pudieron guardar los cambios del turno.");
      throw error;
    }
  };

  const openEdit = (turn) => {
    setEditingTurn(turn);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageTransition>
      <AdminLayout>
        <AdminPageHeader
          eyebrow="Agenda"
          icon={<Calendar size={18} />}
          title="Agenda de turnos"
          subtitle="Organizá los trabajos del día y mantené cada cliente al tanto."
          actions={
            <button className={showForm ? "btn-form-primary" : "btn-primary-admin"} onClick={() => { setEditingTurn(null); setShowForm((current) => !current); }}>
              {showForm ? <X size={18} /> : <Plus size={18} />}
              <span>{showForm ? "Cerrar" : "Nuevo Turno"}</span>
            </button>
          }
        />

        {showForm ? (
          <TurnForm key={editingTurn?.id || "new"} initialData={editingTurn} onAddTurn={editingTurn ? handleUpdateTurn : handleCreateTurn} />
        ) : null}

        <div className="agenda-view-tabs" role="tablist" aria-label="Vista de agenda">
          <button type="button" className={agendaView === "today" ? "active" : ""} onClick={() => setAgendaView("today")}><ListChecks size={17} /><span>Hoy</span></button>
          <button type="button" className={agendaView === "week" ? "active" : ""} onClick={() => setAgendaView("week")}><CalendarRange size={17} /><span>Semana</span></button>
          <button type="button" className={agendaView === "board" ? "active" : ""} onClick={() => setAgendaView("board")}><Columns3 size={17} /><span>En proceso</span></button>
        </div>

        <div className="admin-stack agenda-workspace">
          <TurnsToolbar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />

          {isLoading ? (
            <TurnsTableSkeleton />
          ) : agendaView === "today" ? (
            <TodayAgenda turns={filteredTurns}
              onStatusChange={updateTurnStatus}
              onDeleteTurn={deleteTurn}
              onGenerateReceipt={setReceiptTurn}
              onEditTurn={openEdit}
            />
          ) : agendaView === "week" ? (
            <WeekAgenda turns={filteredTurns} weekOffset={weekOffset} onWeekChange={setWeekOffset} onStatusChange={updateTurnStatus} onEditTurn={openEdit} onDeleteTurn={deleteTurn} />
          ) : <BoardAgenda turns={filteredTurns} onStatusChange={updateTurnStatus} />}
        </div>
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
