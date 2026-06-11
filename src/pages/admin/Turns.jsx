import AdminLayout from "../../components/admin/AdminLayout";
import PageTransition from "../../components/ui/PageTransition";
import TurnsToolbar from "../../components/admin/TurnsToolbar";
import TurnsTable from "../../components/admin/TurnsTable";
import TurnsTableSkeleton from "../../components/admin/TurnsTableSkeleton";
import TurnForm from "../../components/admin/TurnForm";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { useTurns } from "../../hooks/useTurns";
import { useClients } from "../../hooks/useClients";
import { useCash } from "../../hooks/useCash";
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

  const { clients, addClient } = useClients();
  const { addTransaction } = useCash();

  const [showForm, setShowForm] = useState(false);

  const handleCreateTurn = (formData) => {
    const turnId = Date.now();
    
    // 1. Guardar Turno
    addTurn({ id: turnId, ...formData });

    // 2. Guardar Cliente (si no existe)
    const existingClient = clients.find(c => c.phone === formData.phone);
    if (!existingClient) {
      addClient({
        name: formData.client,
        phone: formData.phone,
        vehicle: formData.vehicle
      });
    }

    // 3. Registrar en Caja
    if (formData.amount && Number(formData.amount) > 0) {
      addTransaction({
        description: `Reserva: ${formData.client} - ${formData.service}`,
        type: "income",
        amount: Number(formData.amount),
        method: "Efectivo",
      });
    }

    setShowForm(false);
  };

  return (
    <PageTransition>
      <AdminLayout>
        <AdminPageHeader
          eyebrow="Agenda"
          icon={<Calendar size={18} />}
          title="Programacion operativa"
          subtitle="Filtra, actualiza estados y carga nuevos turnos con sincronización total."
          actions={
            <button className={showForm ? "btn-form-primary" : "btn-primary-admin"} onClick={() => setShowForm((current) => !current)}>
              {showForm ? <X size={18} /> : <Plus size={18} />}
              <span>{showForm ? "Cerrar" : "Nuevo Turno"}</span>
            </button>
          }
        />

        {showForm ? (
          <TurnForm onAddTurn={handleCreateTurn} />
        ) : null}

        <div className="admin-stack" style={{ marginTop: "2rem" }}>
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
