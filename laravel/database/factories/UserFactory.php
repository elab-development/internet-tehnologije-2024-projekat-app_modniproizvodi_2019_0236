<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name'     => $this->faker->name(),
            'username' => $this->faker->unique()->userName(),
            'email'    => $this->faker->unique()->safeEmail(), 
            'password' => 'password',
            'role'     => $this->faker->randomElement([User::ROLE_USER, User::ROLE_ADMIN]),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }
}
