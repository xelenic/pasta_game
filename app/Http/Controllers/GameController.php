<?php

namespace App\Http\Controllers;

use App\Models\GameSetting;
use Illuminate\View\View;

class GameController extends Controller
{
    /**
     * Show the slicing game with the settings chosen on the admin page.
     */
    public function __invoke(): View
    {
        return view('welcome', ['settings' => GameSetting::current()]);
    }
}
