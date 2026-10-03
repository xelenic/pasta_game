<?php

namespace App\Http\Controllers\Admin;

use App\GameDifficulty;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateGameSettingRequest;
use App\Models\GameSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class GameSettingController extends Controller
{
    /**
     * Show the game settings form.
     */
    public function edit(): View
    {
        return view('admin.settings', [
            'settings' => GameSetting::current(),
            'difficulties' => GameDifficulty::cases(),
        ]);
    }

    /**
     * Save the game settings. The next game started on the home page uses them.
     */
    public function update(UpdateGameSettingRequest $request): RedirectResponse
    {
        GameSetting::current()->update($request->validated());

        return redirect()
            ->route('admin.settings.edit')
            ->with('status', 'Settings saved. New games use them right away.');
    }
}
