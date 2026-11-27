import type {
  MealSlot,
  MembershipStatus,
  MemberStatus,
  NutritionGoal,
  PaymentMethod,
  PaymentStatus,
  RoutineGoal,
  WorkoutLevel,
} from '../api/types';

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

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Pagado',
  pending: 'En revisión',
  rejected: 'Rechazado',
};

export function getPaymentStatusLabel(status?: PaymentStatus): string {
  return status ? (PAYMENT_STATUS_LABELS[status] ?? status) : 'Pagado';
}

const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
};

export function getMemberStatusLabel(status: MemberStatus): string {
  return MEMBER_STATUS_LABELS[status] ?? status;
}

const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  active: 'Activa',
  paused: 'Pausada',
  expired: 'Vencida',
  cancelled: 'Cancelada',
};

export function getMembershipStatusLabel(status: MembershipStatus): string {
  return MEMBERSHIP_STATUS_LABELS[status] ?? status;
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

const ROUTINE_GOAL_LABELS: Record<RoutineGoal, string> = {
  strength: 'Fuerza',
  hypertrophy: 'Hipertrofia',
  fat_loss: 'Definición',
  endurance: 'Resistencia',
  mobility: 'Movilidad',
};

export function getRoutineGoalLabel(goal: RoutineGoal): string {
  return ROUTINE_GOAL_LABELS[goal] ?? goal;
}

const NUTRITION_GOAL_LABELS: Record<NutritionGoal, string> = {
  fat_loss: 'Déficit',
  maintenance: 'Mantenimiento',
  muscle_gain: 'Volumen',
  performance: 'Rendimiento',
};

export function getNutritionGoalLabel(goal: NutritionGoal): string {
  return NUTRITION_GOAL_LABELS[goal] ?? goal;
}

const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Desayuno',
  mid_morning: 'Media mañana',
  lunch: 'Almuerzo',
  snack: 'Merienda',
  dinner: 'Cena',
};

export function getMealSlotLabel(slot: MealSlot): string {
  return MEAL_SLOT_LABELS[slot] ?? slot;
}
