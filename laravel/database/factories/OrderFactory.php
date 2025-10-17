<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'user_id'        => $this->faker->boolean(70) ? User::factory() : null,
            'customer_name'  => $this->faker->name(),
            'customer_email' => $this->faker->safeEmail(),
            'customer_phone' => $this->faker->e164PhoneNumber(),
            'status'         => $this->faker->randomElement([
                Order::STATUS_PENDING,
                Order::STATUS_PAID,
                Order::STATUS_CANCELLED
            ]),
       
            'total_price'    => 0, // popunićemo posle kroz afterCreating
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Order $order) {
            // 1–4 stavke
            $count = $this->faker->numberBetween(1, 4);
            OrderItem::factory($count)->create([
                'order_id' => $order->id,
            ]);

            // recalc total
            $order->load('items')->recalcTotal();
        });
    }
}
