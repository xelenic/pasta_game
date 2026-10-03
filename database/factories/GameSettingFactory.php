<?php

namespace Database\Factories;

use App\GameDifficulty;
use App\Models\GameSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GameSetting>
 */
class GameSettingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'duration_seconds' => fake()->numberBetween(GameSetting::MIN_DURATION_SECONDS, GameSetting::MAX_DURATION_SECONDS),
            'difficulty' => fake()->randomElement(GameDifficulty::cases()),
        ];
    }
}
