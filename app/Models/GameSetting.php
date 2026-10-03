<?php

namespace App\Models;

use App\GameDifficulty;
use Database\Factories\GameSettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * The single row of game settings that admins edit and the game reads on every page load.
 *
 * @property int $duration_seconds
 * @property GameDifficulty $difficulty
 */
#[Fillable(['duration_seconds', 'difficulty'])]
class GameSetting extends Model
{
    /** @use HasFactory<GameSettingFactory> */
    use HasFactory;

    public const int MIN_DURATION_SECONDS = 15;

    public const int MAX_DURATION_SECONDS = 300;

    /**
     * Mirrors the column defaults so a freshly created settings row is usable before it is reloaded.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'duration_seconds' => 60,
        'difficulty' => 'normal',
    ];

    /**
     * Get the current settings, creating the default row the first time.
     */
    public static function current(): self
    {
        return static::query()->orderBy('id')->firstOrCreate();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration_seconds' => 'integer',
            'difficulty' => GameDifficulty::class,
        ];
    }
}
