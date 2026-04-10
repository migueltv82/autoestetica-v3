import { getTodayString } from "../utils/date";

export function createDemoTurns() {
  const today = getTodayString();

  return [
    {
      id: 1,
      date: today,
      time: "10:00",
      client: "Juan Perez",
      phone: "3815550001",
      vehicle: "Auto",
      service: "Lavado premium",
      status: "Pendiente",
      notes: "",
    },
    {
      id: 2,
      date: today,
      time: "12:00",
      client: "Maria Lopez",
      phone: "3815550002",
      vehicle: "Camioneta",
      service: "Limpieza de interior",
      status: "Confirmado",
      notes: "",
    },
  ];
}
