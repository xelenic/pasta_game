<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)->use(RefreshDatabase::class);

describe('create', function () {
    it('shows the login form to guests', function () {
        $response = $this->get('/admin/login');

        $response->assertSee('Admin login');
    });

    it('redirects admins who are already logged in to the settings page', function () {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/admin/login');

        $response->assertRedirect('/admin');
    });
});

describe('store', function () {
    it('logs an admin in and redirects to the settings page', function () {
        $admin = User::factory()->admin()->create();

        $response = $this->post('/admin/login', ['email' => $admin->email, 'password' => 'password']);

        $response->assertRedirect('/admin');
        $this->assertAuthenticatedAs($admin);
    });

    it('rejects a wrong password', function () {
        $admin = User::factory()->admin()->create();

        $response = $this->from('/admin/login')->post('/admin/login', ['email' => $admin->email, 'password' => 'wrong-password']);

        $response->assertSessionHasErrors(['email' => 'These credentials do not match an admin account.']);
        $this->assertGuest();
    });

    it('refuses users who are not admins', function () {
        $user = User::factory()->create();

        $response = $this->from('/admin/login')->post('/admin/login', ['email' => $user->email, 'password' => 'password']);

        $response->assertSessionHasErrors(['email' => 'These credentials do not match an admin account.']);
        $this->assertGuest();
    });

    it('returns 429 after five login attempts in a minute', function () {
        $admin = User::factory()->admin()->create();
        $credentials = ['email' => $admin->email, 'password' => 'wrong-password'];
        foreach (range(1, 5) as $attempt) {
            $this->post('/admin/login', $credentials);
        }

        $response = $this->post('/admin/login', $credentials);

        $response->assertTooManyRequests();
    });
});

describe('destroy', function () {
    it('logs the admin out and returns to the login page', function () {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/logout');

        $response->assertRedirect('/admin/login');
        $this->assertGuest();
    });
});
