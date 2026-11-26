export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface BillingStatsMeta {
  total_revenue_cents: number;
  formatted_total_revenue: string;
  distinct_members_count: number;
  total_payments_count: number;
}

export interface PaymentsListResponse extends PaginatedResponse<PaymentItem> {
  stats: BillingStatsMeta;
}

export interface SingleResponse<T> {
  data: T;
}

export interface HealthStatus {
  status: 'ok' | 'degraded';
  database: 'connected' | 'disconnected';
  timestamp: string;
}

export type MemberStatus = 'active' | 'inactive' | 'suspended';

export interface MemberItem {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  document_number: string | null;
  status: MemberStatus;
  joined_at: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface PlanItem {
  id: number;
  name: string;
  slug: string;
  tagline: string | null;
  price_cents: number;
  formatted_price: string;
  duration_days: number;
  billing_period_label: string;
  description: string | null;
  features: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface PaymentItem {
  id: number;
  member_id: number;
  member_name: string;
  plan_id: number;
  plan_name: string;
  amount_cents: number;
  formatted_amount: string;
  payment_method: PaymentMethod;
  paid_at: string;
  notes?: string | null;
}

export type WorkoutLevel = 'all_levels' | 'beginner' | 'intermediate' | 'advanced';

export interface WorkoutItem {
  id: number;
  name: string;
  slug: string;
  category: string;
  level: WorkoutLevel;
  default_duration_minutes: number;
  badge_label: string;
  image_url: string | null;
  display_order: number;
  description: string | null;
  created_at: string | null;
}

export type SessionStatus = 'scheduled' | 'cancelled' | 'completed';

export interface ClassSessionItem {
  id: number;
  workout_id: number;
  workout_name: string;
  category: string;
  day_of_week: number;
  day_label: string;
  room: string;
  instructor_name: string;
  starts_at: string;
  start_time_label: string;
  short_time_label: string;
  duration_minutes: number;
  capacity: number;
  enrolled_count: number;
  accent_color: string;
  status: SessionStatus;
}

export interface DashboardSummary {
  kpis: {
    monthly_revenue_cents: number;
    formatted_monthly_revenue: string;
    active_members_count: number;
    monthly_payments_count: number;
    next_session: ClassSessionItem | null;
  };
  recent_payments: PaymentItem[];
  featured_sessions: ClassSessionItem[];
  club_status: {
    is_open: boolean;
    hours: string;
  };
}
