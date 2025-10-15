<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = ucfirst($this->faker->unique()->words(3, true));
        return [
            'category_id' => Category::factory(),
            'name'        => $name,
            'description' => $this->faker->paragraph(),
            'price'       => $this->faker->randomFloat(2, 10, 300),
            'image'       => $this->faker->imageUrl(800, 1000, 'fashion', true),
            'is_active'   => $this->faker->boolean(95),
            'sku'         => strtoupper(Str::random(3)).'-'.$this->faker->unique()->numberBetween(10000, 99999),
            'stock'       => $this->faker->numberBetween(0, 200),
        ];
    }
}
