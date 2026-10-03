<?php

use App\GameDifficulty;
use App\Models\GameSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)->use(RefreshDatabase::class);

describe('edit', function () {
    it('redirects guests to the admin login', function () {
        $response = $this->get('/admin');

        $response->assertRedirect('/admin/login');
    });

    it('returns 403 for users who are not admins', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/admin');

        $response->assertForbidden();
    });

    it('shows the saved game length and difficulty to admins', function () {
        $admin = User::factory()->admin()->create();
        GameSetting::factory()->create(['duration_seconds' => 90, 'difficulty' => GameDifficulty::Hard]);

        $response = $this->actingAs($admin)->get('/admin');

        $response->assertSee('value="90"', false);
        $response->assertViewHas('settings', fn (GameSetting $settings): bool => $settings->difficulty === GameDifficulty::Hard);
    });
});

describe('update', function () {
    it('saves the new game length and difficulty', function () {
        $admin = User::factory()->admin()->create();
        GameSetting::factory()->create(['duration_seconds' => 60, 'difficulty' => GameDifficulty::Normal]);

        $response = $this->actingAs($admin)->from('/admin')->put('/admin', [
            'duration_seconds' => 120,
            'difficulty' => 'easy',
        ]);

        $response->assertRedirect('/admin');
        $response->assertSessionHas('status', 'Settings saved. New games use them right away.');
        expect(GameSetting::sole())
            ->duration_seconds->toBe(120)
            ->difficulty->toBe(GameDifficulty::Easy);
    });

    it('rejects a game length outside 15 to 300 seconds', function (int $seconds) {
        $admin = User::factory()->admin()->create();
        $settings = GameSetting::factory()->create(['duration_seconds' => 60]);

        $response = $this->actingAs($admin)->from('/admin')->put('/admin', [
            'duration_seconds' => $seconds,
            'difficulty' => 'normal',
        ]);

        $response->assertSessionHasErrors(['duration_seconds' => 'The game length must be between 15 and 300 seconds.']);
        expect($settings->fresh()->duration_seconds)->toBe(60);
    })->with([14, 301]);

    it('rejects an unknown difficulty', function () {
        $admin = User::factory()->admin()->create();
        $settings = GameSetting::factory()->create(['difficulty' => GameDifficulty::Normal]);

        $response = $this->actingAs($admin)->from('/admin')->put('/admin', [
            'duration_seconds' => 60,
            'difficulty' => 'impossible',
        ]);

        $response->assertSessionHasErrors(['difficulty' => 'Choose Easy, Normal or Hard.']);
        expect($settings->fresh()->difficulty)->toBe(GameDifficulty::Normal);
    });

    it('requires a game length and a difficulty', function () {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->from('/admin')->put('/admin', []);

        $response->assertSessionHasErrors([
            'duration_seconds' => 'The game length field is required.',
            'difficulty' => 'The difficulty field is required.',
        ]);
    });

    it('redirects guests to the admin login without saving', function () {
        $settings = GameSetting::factory()->create(['duration_seconds' => 60]);

        $response = $this->put('/admin', ['duration_seconds' => 120, 'difficulty' => 'easy']);

        $response->assertRedirect('/admin/login');
        expect($settings->fresh()->duration_seconds)->toBe(60);
    });

    it('returns 403 when a user who is not an admin tries to save', function () {
        $user = User::factory()->create();
        $settings = GameSetting::factory()->create(['duration_seconds' => 60]);

        $response = $this->actingAs($user)->put('/admin', ['duration_seconds' => 120, 'difficulty' => 'easy']);

        $response->assertForbidden();
        expect($settings->fresh()->duration_seconds)->toBe(60);
    });
});
