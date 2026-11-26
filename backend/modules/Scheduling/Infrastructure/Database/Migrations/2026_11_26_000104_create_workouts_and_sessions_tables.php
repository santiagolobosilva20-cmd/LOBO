<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\Scheduling\Domain\Enums\SessionStatus;
use Modules\Scheduling\Domain\Enums\WorkoutLevel;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workouts', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 120)->unique();
            $table->string('category', 60)->index();
            $table->string('level', 24)->default(WorkoutLevel::AllLevels->value);
            $table->unsignedSmallInteger('default_duration_minutes')->default(45);
            $table->string('badge_label', 60)->default('TODOS LOS NIVELES');
            $table->string('image_url', 255)->nullable();
            $table->unsignedSmallInteger('display_order')->default(1);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('class_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('workout_id')->constrained('workouts')->restrictOnDelete();
            $table->unsignedTinyInteger('day_of_week')->default(1)->index();
            $table->string('room', 80);
            $table->string('instructor_name', 100);
            $table->timestamp('starts_at')->index();
            $table->unsignedSmallInteger('duration_minutes')->default(45);
            $table->unsignedSmallInteger('capacity')->default(12);
            $table->unsignedSmallInteger('enrolled_count')->default(0);
            $table->string('accent_color', 20)->default('#CEF542');
            $table->string('status', 24)->default(SessionStatus::Scheduled->value)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_sessions');
        Schema::dropIfExists('workouts');
    }
};
