<?php

use App\GameDifficulty;
use App\Models\GameSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)->use(RefreshDatabase::class);

it('loads the game stylesheet and scripts on the home page in dependency order', function () {
    $response = $this->get('/');

    $response->assertSeeInOrder([
        'game/css/style.css',
        'game/js/art.js',
        'game/js/audio.js',
        'game/js/game.js',
    ], false);
});

it('only links to game assets that exist in the public directory', function () {
    $response = $this->get('/');

    preg_match_all('#(?:href|src)="'.preg_quote(asset('game').'/', '#').'([^"]+)"#', $response->getContent(), $matches);
    $paths = array_map(fn (string $path): string => public_path("game/{$path}"), array_unique($matches[1]));

    expect($paths)->toHaveCount(6)->each->toBeFile();
});

it('gives the game the length and difficulty saved on the admin page', function () {
    GameSetting::factory()->create(['duration_seconds' => 90, 'difficulty' => GameDifficulty::Hard]);

    $response = $this->get('/');

    $response->assertSee('data-game-seconds="90"', false);
    $response->assertSee('data-difficulty="hard"', false);
    $response->assertSee('Keep slicing for 90 seconds.');
});

it('starts a 60 second normal game when no settings have been saved', function () {
    $response = $this->get('/');

    $response->assertSee('data-game-seconds="60"', false);
    $response->assertSee('data-difficulty="normal"', false);
    $response->assertSee('Keep slicing for 60 seconds.');
});
