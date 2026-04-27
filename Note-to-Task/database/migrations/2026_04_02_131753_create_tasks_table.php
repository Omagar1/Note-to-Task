<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('made_from_note_id')->constrained('notes')->onDelete('cascade');
            $table->foreignId('sub_task_of_task_id')->nullable()->constrained('tasks')->onDelete('cascade');
            $table->string('title');
            $table->string('extra_info')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('deadline')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
