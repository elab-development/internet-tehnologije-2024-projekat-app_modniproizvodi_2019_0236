<?php

namespace Database\Factories;

use App\Models\Message;
use Illuminate\Database\Eloquent\Factories\Factory;

class MessageFactory extends Factory
{
    protected $model = Message::class;

    public function definition(): array
    {
        $text = $this->faker->paragraph();
        return [
            'name'      => $this->faker->name(),
            'email'     => $this->faker->safeEmail(), 
            'body'   => $text,
            'processed' => $this->faker->boolean(20),
        ];
    }
}
