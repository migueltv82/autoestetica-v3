import { useCallback, useEffect, useState } from "react";
import {
  fetchAllFidelityCards,
  fetchFidelityCardsByClient,
  redeemFidelityReward,
  setFidelityCardStamps,
  stampFidelityCardForClient,
  subscribeToFidelityCards,
} from "../services/fidelityApi";

export function useFidelity({ clientId = null, realtime = true } = {}) {
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (clientId) {
        const clientCards = await fetchFidelityCardsByClient(clientId);
        setCards(clientCards);
        setActiveCard(clientCards[0] || null);
      } else {
        const allCards = await fetchAllFidelityCards();
        setCards(allCards);
      }
    } catch (err) {
      console.error("Error en useFidelity:", err);
      setError(err.message || "Error al obtener tarjetas fidelity");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  useEffect(() => {
    if (!realtime) return undefined;
    const unsubscribe = subscribeToFidelityCards(() => {
      loadData();
    });

    return () => unsubscribe();
  }, [loadData, realtime]);

  const addStamp = useCallback(
    async (targetClientId, vehicleId = null, workOrderId = null, notes = null) => {
      const result = await stampFidelityCardForClient(targetClientId || clientId, vehicleId, workOrderId, notes);
      await loadData();
      return result;
    },
    [clientId, loadData]
  );

  const redeemReward = useCallback(
    async (cardId) => {
      const newCard = await redeemFidelityReward(cardId);
      await loadData();
      return newCard;
    },
    [loadData]
  );

  const updateStamps = useCallback(async (cardId, stampsCount) => {
    const updated = await setFidelityCardStamps(cardId, stampsCount);
    await loadData();
    return updated;
  }, [loadData]);

  return {
    cards,
    activeCard,
    isLoading,
    error,
    refresh: loadData,
    addStamp,
    redeemReward,
    updateStamps,
  };
}
