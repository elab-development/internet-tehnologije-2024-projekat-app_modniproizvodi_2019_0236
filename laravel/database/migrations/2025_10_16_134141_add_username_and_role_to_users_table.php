<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // username: unique, posle name
            $table->string('username', 60)->nullable()->after('name');
            // role: user/admin (može i enum/check, ali string je najjednostavniji)
            $table->string('role', 20)->default('user')->after('password');
        });

        // Popuni username za postojeće redove da UNIQUE ne pukne
        // npr. uzmi deo pre @ iz email-a + id ako treba
        DB::table('users')->select('id','email')->orderBy('id')->chunkById(200, function ($users) {
            foreach ($users as $u) {
                $base = strstr($u->email, '@', true) ?: ('user'.$u->id);
                $username = $base;
                $i = 1;
                // obezbedi jedinstvenost
                while (DB::table('users')->where('username', $username)->where('id','<>',$u->id)->exists()) {
                    $username = $base . $i++;
                }
                DB::table('users')->where('id', $u->id)->update(['username' => $username]);
            }
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unique('username');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn(['username','role']);
        });
    }
};
