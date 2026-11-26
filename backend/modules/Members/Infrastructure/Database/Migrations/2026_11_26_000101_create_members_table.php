<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\Members\Domain\Enums\MemberStatus;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table): void {
            $table->id();
            $table->string('full_name', 120);
            $table->string('email', 160)->nullable()->unique();
            $table->string('phone', 40)->nullable();
            $table->string('document_number', 40)->nullable();
            $table->string('status', 24)->default(MemberStatus::Active->value)->index();
            $table->date('joined_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
