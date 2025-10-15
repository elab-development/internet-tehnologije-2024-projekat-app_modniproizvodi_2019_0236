<?php

namespace Database\Factories;

use App\Models\OrderItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        $product = Product::factory()->create(); // potreban snapshot naziva/cene

        $price = $this->faker->randomFloat(2, 10, 300);
        $qty   = $this->faker->numberBetween(1, 3);

        return [
            'order_id'   => Order::factory(),
            'product_id' => $product->id,
            'name'       => $product->name,
            'price'      => $price,
            'quantity'   => $qty,
            // line_total će se izračunati u model hook-u, ali nije loše setovati i ovde:
            'line_total' => round($price * $qty, 2),
        ];
    }
}
