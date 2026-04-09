import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import TurnsToolbar from "../../components/admin/TurnsToolbar";
import TurnsTable from "../../components/admin/TurnsTable";
import TurnsTableSkeleton from "../../components/admin/TurnsTableSkeleton";
import TurnForm from "../../components/admin/TurnForm";
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
        subtitle={isLoading ? "Sincronizando agenda..." : `Gestioná tus ${filteredTurns.length} turnos activos con precisión y profesionalismo.`}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", gap: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Calendar size={20} className="text-primary" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Programación Operativa</h2>
          </div>
          <button 
            className={showForm ? "btn-ghost" : "btn-premium"} 
            onClick={() => setShowForm(!showForm)} 
            style={{ minWidth: "200px", justifyContent: "center" }}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? "Cerrar" : "Nuevo Turno Manual"}
          </button>
        </div>

        {showForm && (
          <div style={{ marginBottom: "3rem", animation: "slideDown 0.4s ease-out" }}>
            <TurnForm onAddTurn={(t) => {
              addTurn(t);
              setShowForm(false);
            }} />
          </div>
        )}

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
      </AdminLayout>
    </PageTransition>
  );
}

export default Turns;