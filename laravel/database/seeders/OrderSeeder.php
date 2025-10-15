<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        // Obavezne pretpostavke
        if (User::count() === 0)  $this->call(UserSeeder::class);
        if (Category::count() === 0) $this->call(CategorySeeder::class);
        if (Product::count() === 0)  $this->call(ProductSeeder::class);

        // OrderFactory već pravi OrderItem-e i radi recalcTotal()
        Order::factory(15)->create();
    }
}
