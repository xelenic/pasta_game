<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

pest()->extend(TestCase::class)->use(RefreshDatabase::class);

it('creates an admin account with the given password', function () {
    $this->artisan('game:admin', ['email' => 'Chef@Milan.test'])
        ->expectsQuestion('Password (at least 8 characters)', 'spaghetti123')
        ->expectsQuestion('Confirm password', 'spaghetti123')
        ->expectsOutput('Admin account created for chef@milan.test.')
        ->assertSuccessful();

    $admin = User::where('email', 'chef@milan.test')->sole();
    expect($admin)
        ->name->toBe('Admin')
        ->is_admin->toBeTrue();
    expect(Hash::check('spaghetti123', $admin->password))->toBeTrue();
});

it('gives an existing user admin access and a new password', function () {
    $user = User::factory()->create(['name' => 'Maria', 'email' => 'maria@milan.test']);

    $this->artisan('game:admin', ['email' => 'maria@milan.test'])
        ->expectsQuestion('Password (at least 8 characters)', 'linguine456')
        ->expectsQuestion('Confirm password', 'linguine456')
        ->expectsOutput('maria@milan.test is now an admin with the new password.')
        ->assertSuccessful();

    $user->refresh();
    expect($user)
        ->name->toBe('Maria')
        ->is_admin->toBeTrue();
    expect(Hash::check('linguine456', $user->password))->toBeTrue();
});

it('rejects a password shorter than 8 characters', function () {
    $this->artisan('game:admin', ['email' => 'chef@milan.test'])
        ->expectsQuestion('Password (at least 8 characters)', 'penne')
        ->expectsQuestion('Confirm password', 'penne')
        ->expectsOutput('The password field must be at least 8 characters.')
        ->assertFailed();

    $this->assertDatabaseCount('users', 0);
});

it('rejects passwords that do not match', function () {
    $this->artisan('game:admin', ['email' => 'chef@milan.test'])
        ->expectsQuestion('Password (at least 8 characters)', 'spaghetti123')
        ->expectsQuestion('Confirm password', 'spaghetti124')
        ->expectsOutput('The password field confirmation does not match.')
        ->assertFailed();

    $this->assertDatabaseCount('users', 0);
});
