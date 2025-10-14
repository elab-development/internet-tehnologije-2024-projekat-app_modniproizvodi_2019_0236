<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('messages', function (Blueprint $table) {
            $table->renameColumn('message', 'body');
        });
    }

    public function down(): void {
        Schema::table('messages', function (Blueprint $table) {
            $table->renameColumn('body', 'message');
        });
    }
};
