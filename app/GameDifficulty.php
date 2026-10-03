<?php

namespace App;

/**
 * How hard the slicing round is. The game script maps each value to its throw speed,
 * wave size and share of rotten vegetables.
 */
enum GameDifficulty: string
{
    case Easy = 'easy';
    case Normal = 'normal';
    case Hard = 'hard';

    public function label(): string
    {
        return match ($this) {
            self::Easy => 'Easy',
            self::Normal => 'Normal',
            self::Hard => 'Hard',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Easy => 'Slower throws, small waves and only a few rotten veges.',
            self::Normal => 'Balanced speed. Waves grow and rotten veges appear more often as time runs down.',
            self::Hard => 'Fast throws, big waves and lots of rotten veges from the start.',
        };
    }
}
