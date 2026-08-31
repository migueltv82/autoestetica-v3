function pad(value) {
  return String(value).padStart(2, "0");
}

export function getTodayString(baseDate = new Date()) {
  return `${baseDate.getFullYear()}-${pad(baseDate.getMonth() + 1)}-${pad(baseDate.getDate())}`;
}

export function shiftDateByDays(days, baseDate = new Date()) {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + days);
  return getTodayString(nextDate);
}

export function turnOccupiesDate(turn, date) {
  const lastDate = turn.lastOccupiedDate || turn.endDate || turn.date;
  return Boolean(turn.date && date && turn.date <= date && date <= lastDate);
}
