<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routines', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('member_id')->nullable()->constrained('members')->cascadeOnDelete();
            $table->string('member_name_snapshot', 120)->nullable();
            $table->string('title', 120);
            $table->string('goal', 32)->default('strength')->index();
            $table->string('level', 24)->default('all_levels');
            $table->unsignedTinyInteger('days_per_week')->default(4);
            $table->unsignedSmallInteger('estimated_minutes')->default(50);
            $table->boolean('is_template')->default(true)->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('routine_exercises', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('routine_id')->constrained('routines')->cascadeOnDelete();
            $table->string('day_label', 60);
            $table->string('exercise_name', 120);
            $table->unsignedTinyInteger('sets')->default(3);
            $table->string('reps', 30)->default('10-12');
            $table->string('target_weight', 40)->nullable();
            $table->unsignedSmallInteger('rest_seconds')->default(60);
            $table->unsignedSmallInteger('sort_order')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routine_exercises');
        Schema::dropIfExists('routines');
    }
};
