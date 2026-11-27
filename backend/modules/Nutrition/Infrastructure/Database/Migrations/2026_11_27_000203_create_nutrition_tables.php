<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nutrition_plans', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('member_id')->nullable()->constrained('members')->cascadeOnDelete();
            $table->string('member_name_snapshot', 120)->nullable();
            $table->string('title', 120);
            $table->string('goal', 32)->default('maintenance')->index();
            $table->unsignedSmallInteger('daily_calories');
            $table->unsignedSmallInteger('protein_grams');
            $table->unsignedSmallInteger('carbs_grams');
            $table->unsignedSmallInteger('fats_grams');
            $table->decimal('water_liters', 3, 1)->default(2.5);
            $table->boolean('is_template')->default(true)->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('meal_entries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('nutrition_plan_id')->constrained('nutrition_plans')->cascadeOnDelete();
            $table->string('meal_slot', 24);
            $table->string('title', 120);
            $table->text('foods_summary');
            $table->unsignedSmallInteger('calories')->default(0);
            $table->unsignedSmallInteger('protein_grams')->default(0);
            $table->unsignedSmallInteger('carbs_grams')->default(0);
            $table->unsignedSmallInteger('fats_grams')->default(0);
            $table->unsignedSmallInteger('sort_order')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meal_entries');
        Schema::dropIfExists('nutrition_plans');
    }
};
