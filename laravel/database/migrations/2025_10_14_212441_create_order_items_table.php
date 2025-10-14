<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete()->cascadeOnUpdate();
            $table->string('name'); // snapshot naziva
            $table->decimal('price', 10, 2); // snapshot cene
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('line_total', 10, 2); // price * quantity
            $table->timestamps();

            $table->index(['order_id', 'product_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('order_items');
    }
};
