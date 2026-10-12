export interface CalendarDate {
  readonly year: number;
  readonly month: number; // 0 = enero, 11 = diciembre
  readonly day: number; // 1..31
}

export interface YearMonth {
  readonly year: number;
  readonly month: number;
}

/** La semana empieza en lunes. */
export const WEEKDAY_LABELS: readonly string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const MONTH_LABELS: readonly string[] = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** 0 = lunes ... 6 = domingo (lo que necesita la rejilla). */
export function firstWeekdayOfMonth(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay(); // 0 = domingo
  return (jsDay + 6) % 7;
}

export function toIsoDate({ year, month, day }: CalendarDate): string {
  return `${String(year).padStart(4, '0')}-${pad2(month + 1)}-${pad2(day)}`;
}

export function parseIsoDate(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match === null) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 0 ||
    month > 11 ||
    day < 1 ||
    day > daysInMonth(year, month)
  ) {
    return null;
  }
  return { year, month, day };
}

export function todayParts(): CalendarDate {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

export function toYearMonth({ year, month }: CalendarDate): YearMonth {
  return { year, month };
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
}

export function formatMonthLabel({ year, month }: YearMonth): string {
  return `${MONTH_LABELS[month] ?? ''} ${year}`.trim();
}

export function formatLongDate(isoDate: string): string {
  const parts = parseIsoDate(isoDate);
  if (parts === null) {
    return isoDate;
  }
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(parts.year, parts.month, parts.day));
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}
