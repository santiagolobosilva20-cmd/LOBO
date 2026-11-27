<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workout_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->string('member_name_snapshot', 120);
            $table->foreignId('workout_id')->nullable()->constrained('workouts')->nullOnDelete();
            $table->foreignId('routine_id')->nullable()->constrained('routines')->nullOnDelete();
            $table->string('title', 120);
            $table->string('category', 60)->default('ENTRENAMIENTO');
            $table->date('performed_at')->index();
            $table->unsignedSmallInteger('duration_minutes')->default(45);
            $table->unsignedTinyInteger('effort_rpe')->default(7);
            $table->unsignedSmallInteger('calories_estimate')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workout_logs');
    }
};
