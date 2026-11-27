<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_bookings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('class_session_id')->constrained('class_sessions')->cascadeOnDelete();
            $table->unsignedBigInteger('member_id')->index();
            $table->string('member_name_snapshot', 120);
            $table->string('status', 24)->default('booked')->index();
            $table->timestamps();

            $table->unique(['class_session_id', 'member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_bookings');
    }
};
