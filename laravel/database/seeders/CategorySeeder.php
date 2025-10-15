<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // 6 nasumičnih + par smislenih kategorija
        Category::factory(6)->create();

        // (opciono) par fiksnih primera
        Category::query()->firstOrCreate(
            ['slug' => 'haljine'],
            ['name' => 'Haljine', 'description' => 'Moderne i elegantne haljine', 'is_active' => true]
        );
        Category::query()->firstOrCreate(
            ['slug' => 'jakne'],
            ['name' => 'Jakne', 'description' => 'Sezonske jakne i kaputi', 'is_active' => true]
        );
    }
}
