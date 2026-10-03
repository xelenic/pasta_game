<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // A user created in this request has no is_admin value until it is reloaded, so null means "not an admin".
        Gate::define('manage-game-settings', fn (User $user): bool => $user->is_admin === true);

        RateLimiter::for('admin-login', function (Request $request): Limit {
            return Limit::perMinute(5)->by(Str::transliterate(Str::lower($request->string('email')).'|'.$request->ip()));
        });
    }
}
