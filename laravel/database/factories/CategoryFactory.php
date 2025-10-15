<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);
        return [
            'name'        => ucfirst($name),
            'description' => $this->faker->sentence(12),
            'slug'        => Str::slug($name),
            'is_active'   => $this->faker->boolean(90),
        ];
    }
}
