<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->text('message'); // sadržaj poruke (kontakt forma)
            $table->boolean('processed')->default(false);
            $table->timestamps();

            $table->index('processed');
        });
    }

    public function down(): void {
        Schema::dropIfExists('messages');
    }
};
