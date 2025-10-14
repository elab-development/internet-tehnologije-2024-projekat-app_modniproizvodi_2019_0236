<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::rename('messages', 'contact_messages');
    }

    public function down(): void {
        Schema::rename('contact_messages', 'messages');
    }
};
