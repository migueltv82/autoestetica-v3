import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import TurnsToolbar from "../../components/admin/TurnsToolbar";
import TurnsTable from "../../components/admin/TurnsTable";
import TurnsTableSkeleton from "../../components/admin/TurnsTableSkeleton";
import TurnForm from "../../components/admin/TurnForm";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { useTurns } from "../../hooks/useTurns";
import { Calendar, Plus, X } from "lucide-react";
import { useState } from "react";

function Turns() {
  const {
    filteredTurns,
    filters,
    isLoading,
    addTurn,
    handleFilterChange,
    clearFilters,
    updateTurnStatus,
    deleteTurn,
  } = useTurns();

  const [showForm, setShowForm] = useState(false);

  return (
    <PageTransition>
      <AdminLayout
        title="Agenda de Turnos"
        subtitle={isLoading ? "Sincronizando agenda..." : `Gestiona ${filteredTurns.length} turnos activos con una vista clara y operativa.`}
      >
        <AdminPageHeader
          eyebrow="Agenda"
          icon={<Calendar size={18} />}
          title="Programacion operativa"
          subtitle="Filtra, actualiza estados y carga nuevos turnos sin salir de la misma vista."
          actions={
            <button className={showForm ? "btn-ghost" : "btn-premium"} onClick={() => setShowForm((current) => !current)}>
              {showForm ? <X size={18} /> : <Plus size={18} />}
              <span>{showForm ? "Cerrar formulario" : "Nuevo turno manual"}</span>
            </button>
          }
        />

        {showForm ? (
          <TurnForm
            onAddTurn={(turn) => {
              addTurn(turn);
              setShowForm(false);
            }}
          />
        ) : null}

        <div className="admin-stack">
          <TurnsToolbar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />

          {isLoading ? (
            <TurnsTableSkeleton />
          ) : (
            <TurnsTable
              turns={filteredTurns}
              onStatusChange={updateTurnStatus}
              onDeleteTurn={deleteTurn}
            />
          )}
        </div>
      </AdminLayout>
    </PageTransition>
  );
}

export default Turns;
