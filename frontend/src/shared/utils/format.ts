import type { MemberStatus, PaymentMethod, WorkoutLevel } from '../api/types';

export function formatCurrencyFromCents(cents: number): string {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  return `$${(safeCents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatSpanishDateHeader(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatWeekdayProgressLabel(date: Date = new Date()): string {
  const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date);
  return `${weekday.toUpperCase()} DE PROGRESO`;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
};

export function getPaymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
};

export function getMemberStatusLabel(status: MemberStatus): string {
  return MEMBER_STATUS_LABELS[status] ?? status;
}

const WORKOUT_LEVEL_LABELS: Record<WorkoutLevel, string> = {
  all_levels: 'Todos los niveles',
  beginner: 'Inicial',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export function getMemberInitials(fullName: string): string {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return 'LC';
  }
  return tokens
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function getWorkoutLevelLabel(level: WorkoutLevel): string {
  return WORKOUT_LEVEL_LABELS[level] ?? level;
}

