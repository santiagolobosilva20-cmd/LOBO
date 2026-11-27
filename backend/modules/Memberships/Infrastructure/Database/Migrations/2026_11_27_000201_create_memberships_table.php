<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\Memberships\Domain\Enums\MembershipStatus;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memberships', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('plans')->restrictOnDelete();
            $table->foreignId('last_payment_id')->nullable()->constrained('payments')->nullOnDelete();
            $table->string('member_name_snapshot', 120);
            $table->string('plan_name_snapshot', 100);
            $table->date('starts_at');
            $table->date('ends_at')->index();
            $table->string('status', 24)->default(MembershipStatus::Active->value)->index();
            $table->boolean('auto_renew')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memberships');
    }
};
