<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->restrictOnDelete();
            $table->string('member_name_snapshot', 120);
            $table->foreignId('plan_id')->constrained('plans')->restrictOnDelete();
            $table->string('plan_name_snapshot', 100);
            $table->unsignedInteger('amount_cents');
            $table->string('payment_method', 24)->index();
            $table->date('paid_at')->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
