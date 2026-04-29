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
        Schema::create('actions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->string('default_trigger_word');
        });

        DB::table('actions')->insert([
            ["name" => "task", "description" => "creates a task", "default_trigger_word" => "task:"],
            ["name" => "event", "description" => "creates a event which has a date and a time for a task, if used outside a task creates a new task", "default_trigger_word" => "deadline:"],
            ["name" => "label", "description" => "creates a label for a note or a task so you can easily refer back ", "default_trigger_word" => "#"],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('actions');
    }
};
