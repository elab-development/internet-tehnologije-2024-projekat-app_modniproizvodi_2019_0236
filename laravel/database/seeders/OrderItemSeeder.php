<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OrderItem;
use App\Models\Order;
use App\Models\Product;

class OrderItemSeeder extends Seeder
{
    public function run(): void
    {
        // Ako želiš dodatne stavke nezavisno od OrderSeeder-a
        if (Order::count() === 0) {
            $this->call(OrderSeeder::class); // kreira i prve stavke
        }

        // Napravi još stavki i raspodeli po postojećim porudžbinama
        $orders = Order::inRandomOrder()->limit(10)->get();
        foreach ($orders as $order) {
            OrderItem::factory(rand(1, 3))->create([
                'order_id' => $order->id,
            ]);
            $order->load('items')->recalcTotal();
        }
    }
}
