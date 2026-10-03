<?php

use App\Http\Controllers\Admin\AuthenticatedSessionController;
use App\Http\Controllers\Admin\GameSettingController;
use App\Http\Controllers\GameController;
use Illuminate\Support\Facades\Route;

Route::get('/', GameController::class)->name('game');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
        Route::post('login', [AuthenticatedSessionController::class, 'store'])
            ->middleware('throttle:admin-login')
            ->name('login.store');
    });

    Route::middleware('auth')->group(function () {
        Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

        Route::middleware('can:manage-game-settings')->group(function () {
            Route::get('/', [GameSettingController::class, 'edit'])->name('settings.edit');
            Route::put('/', [GameSettingController::class, 'update'])->name('settings.update');
        });
    });
});
