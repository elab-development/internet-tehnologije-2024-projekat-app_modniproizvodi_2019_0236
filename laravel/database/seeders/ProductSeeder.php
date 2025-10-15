<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Ako nema kategorija, napravi ih da bi FK postojao
        if (Category::count() === 0) {
            $this->call(CategorySeeder::class);
        }

        Product::factory(40)->create(); // slike/cene/sku/stanje dolazi iz factory-ja
    }
}
