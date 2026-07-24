import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { useFeedback } from "./useFeedback";
import { usePermissions } from "./usePermissions";
import { useRealtimeRefresh } from "./useRealtimeRefresh";
import { normalizeStoredArgentinaPhone } from "../utils/whatsapp";
import {
  buildTurnSchedule,
  createScheduledTurn,
  ensureTurnScheduleAvailable,
  fetchTurns,
  FINANCE_TURN_REALTIME_TABLES,
  saveTurnStatus,
  TURN_REALTIME_TABLES,
  updateScheduledTurn,
  voidTurn,
} from "../services/turnsApi";

const initialFilters = { search: "", date: "", status: "" };

export function useTurns() {
  const { organizationId, user } = useAuth();
  const { confirm, notify } = useFeedback();
  const { canManageFinance, canManageTurns, canDeleteTurns } = usePermissions();
  const [turns, setTurns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  const refresh = useCallback(async (options = {}) => {
    if (!organizationId) return;
    if (!options.silent) setIsLoading(true);

    try {
      const nextTurns = await fetchTurns(organizationId);
      setTurns(nextTurns);
      setError("");
    } catch (queryError) {
      setError(queryError.message);
    }
    setIsLoading(false);
  }, [organizationId]);

  useEffect(() => {
    const timer = setTimeout(() => refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const realtimeTables = useMemo(
    () => (canManageFinance ? [...TURN_REALTIME_TABLES, ...FINANCE_TURN_REALTIME_TABLES] : TURN_REALTIME_TABLES),
    [canManageFinance],
  );
  useRealtimeRefresh(organizationId, realtimeTables, refresh);

  function validateTurnForm(formData) {
    if (!formData.services?.length) throw new Error("Seleccioná al menos un servicio.");

    const normalizedPhone = normalizeStoredArgentinaPhone(formData.phone);
    if (normalizedPhone.length < 8) throw new Error("Ingresá un número de WhatsApp válido.");

    return normalizedPhone;
  }

  async function addTurn(formData) {
    if (!canManageTurns) throw new Error("No tenes permiso para crear turnos.");
    if (!organizationId || !user?.id) throw new Error("La sesión no está lista. Volvé a ingresar.");

    const normalizedPhone = validateTurnForm(formData);
    const { start, end } = buildTurnSchedule(formData);
    await ensureTurnScheduleAvailable({ organizationId, start, end });

    const created = await createScheduledTurn({ formData, phone: normalizedPhone });
    await refresh();
    return created;
  }

  async function updateTurnStatus(turnId, nextStatus) {
    if (!canManageTurns) throw new Error("No tenes permiso para cambiar el estado del turno.");

    const fidelityResult = await saveTurnStatus({ turnId, status: nextStatus });
    setTurns((current) => current.map((turn) => turn.id === turnId ? { ...turn, status: nextStatus } : turn));

    if (fidelityResult?.card) {
      if (fidelityResult.confirmationReady && fidelityResult.created) {
        notify("Tarjeta Fidelity creada. Ya podés enviársela al cliente por WhatsApp.", "success");
      } else if (fidelityResult.newlyUnlocked) {
        notify("🎉 ¡Fidelity Pass completado! Se estampó el 4° sello y el cliente tiene su 5° Lavado Gratis listo.", "success");
      } else if (!fidelityResult.alreadyUnlocked) {
        notify(`✨ Troquel Fidelity asignado (Sello ${fidelityResult.card.stampsCount}/4).`, "info");
      }
    }
    return fidelityResult;
  }

  async function updateTurn(turnId, formData) {
    if (!canManageTurns) throw new Error("No tenes permiso para modificar turnos.");
    const current = turns.find((turn) => turn.id === turnId);
    if (!current) throw new Error("Turno no encontrado.");

    const normalizedPhone = validateTurnForm(formData);
    const { start, end } = buildTurnSchedule(formData);
    await ensureTurnScheduleAvailable({ organizationId, start, end, excludedTurnId: turnId });
    await updateScheduledTurn({ turnId, formData, phone: normalizedPhone });
    await refresh();
  }

  async function deleteTurn(turnId) {
    if (!canDeleteTurns) throw new Error("No tenes permiso para eliminar turnos.");

    const accepted = await confirm({
      title: "Eliminar turno definitivamente",
      message: "Se eliminarán el turno, sus ingresos, pagos y recibo. El cliente y su vehículo se conservarán. Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar todo",
    });
    if (!accepted) return;

    await voidTurn(turnId);
    setTurns((current) => current.filter((turn) => turn.id !== turnId));
    notify("Turno eliminado correctamente.", "success");
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setFilters(initialFilters);
  }

  const filteredTurns = useMemo(() => turns.filter((turn) => {
    const search = filters.search.trim().toLowerCase();
    return (!search || [turn.client, turn.service, turn.vehicle, turn.phone].some((value) => value.toLowerCase().includes(search)))
      && (!filters.date || turn.date === filters.date)
      && (!filters.status || turn.status === filters.status);
  }), [turns, filters]);

  return {
    turns,
    filteredTurns,
    filters,
    isLoading,
    error,
    refresh,
    addTurn,
    updateTurn,
    handleFilterChange,
    clearFilters,
    updateTurnStatus,
    deleteTurn,
  };
}
