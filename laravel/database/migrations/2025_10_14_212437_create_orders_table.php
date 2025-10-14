<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete()->cascadeOnUpdate();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->string('status')->default('pending'); // pending|paid|cancelled
            $table->text('notes')->nullable();
            $table->decimal('total_price', 10, 2)->default(0);
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('orders');
    }
};
