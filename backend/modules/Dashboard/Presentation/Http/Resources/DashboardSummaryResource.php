<?php

declare(strict_types=1);

namespace Modules\Dashboard\Presentation\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Billing\Contracts\DTOs\PaymentSummaryData;
use Modules\Dashboard\Application\DTOs\DashboardSummaryData;
use Modules\Scheduling\Contracts\DTOs\ClassSessionSummaryData;

/**
 * @mixin DashboardSummaryData
 */
final class DashboardSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var DashboardSummaryData $summary */
        $summary = $this->resource;

        return [
            'kpis' => [
                'monthly_revenue_cents' => $summary->billing->monthlyRevenueCents,
                'formatted_monthly_revenue' => $summary->billing->formattedMonthlyRevenue,
                'active_members_count' => $summary->activeMembersCount,
                'monthly_payments_count' => $summary->billing->monthlyPaymentsCount,
                'next_session' => $summary->nextSession !== null
                    ? $this->mapSession($summary->nextSession)
                    : null,
            ],
            'recent_payments' => array_map(
                static fn (PaymentSummaryData $payment): array => [
                    'id' => $payment->id,
                    'member_id' => $payment->memberId,
                    'member_name' => $payment->memberName,
                    'plan_id' => $payment->planId,
                    'plan_name' => $payment->planName,
                    'amount_cents' => $payment->amountCents,
                    'formatted_amount' => $payment->formattedAmount,
                    'payment_method' => $payment->paymentMethod,
                    'paid_at' => $payment->paidAt,
                ],
                $summary->recentPayments,
            ),
            'featured_sessions' => array_map(
                fn (ClassSessionSummaryData $session): array => $this->mapSession($session),
                $summary->featuredSessions,
            ),
            'club_status' => [
                'is_open' => $summary->gymIsOpen,
                'hours' => $summary->gymHoursLabel,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapSession(ClassSessionSummaryData $session): array
    {
        return [
            'id' => $session->id,
            'workout_id' => $session->workoutId,
            'workout_name' => $session->workoutName,
            'category' => $session->category,
            'day_of_week' => $session->dayOfWeek,
            'day_label' => $session->dayLabel,
            'room' => $session->room,
            'instructor_name' => $session->instructorName,
            'starts_at' => $session->startsAt,
            'start_time_label' => $session->startTimeLabel,
            'short_time_label' => $session->shortTimeLabel,
            'duration_minutes' => $session->durationMinutes,
            'capacity' => $session->capacity,
            'enrolled_count' => $session->enrolledCount,
            'accent_color' => $session->accentColor,
            'status' => $session->status,
        ];
    }
}
