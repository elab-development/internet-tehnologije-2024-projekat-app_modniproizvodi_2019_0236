<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Nasumični korisnici
        User::factory(8)->create();
 
        User::query()->firstOrCreate(
            ['email' => 'admin@brand.test'],
            [
                'name' => 'Admin',
                'username' => 'admin',
                'password' => 'admin123', // cast: hashed
                'role' => User::ROLE_ADMIN,
            ]
        );

        User::query()->firstOrCreate(
            ['email' => 'user@brand.test'],
            [
                'name' => 'User Demo',
                'username' => 'userdemo',
                'password' => 'password',
                'role' => User::ROLE_USER,
            ]
        );
    }
}
