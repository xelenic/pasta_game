@props(['title'])

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ $title }} · Milan Pasta Admin</title>

        @fonts
        @vite(['resources/css/app.css'])
    </head>
    <body class="min-h-screen bg-milan-50 font-sans text-gray-900 antialiased">
        <header class="bg-milan-800 text-white shadow-md">
            <div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
                <div class="flex items-center gap-3">
                    <img src="{{ asset('game/assets/milan-logo.webp') }}" alt="Milan" width="640" height="440" class="h-10 w-auto">
                    <span class="font-semibold">Slice the Ingredients <span class="font-normal text-milan-200">· Admin</span></span>
                </div>

                <nav class="flex items-center gap-1 text-sm font-medium">
                    <a href="{{ route('game') }}" class="rounded-md px-3 py-1.5 text-milan-100 hover:bg-white/10">Open game</a>

                    @auth
                        <form method="POST" action="{{ route('admin.logout') }}">
                            @csrf
                            <button type="submit" class="cursor-pointer rounded-md px-3 py-1.5 text-milan-100 hover:bg-white/10">Log out</button>
                        </form>
                    @endauth
                </nav>
            </div>
        </header>

        <main class="mx-auto max-w-3xl px-4 py-8">
            {{ $slot }}
        </main>
    </body>
</html>
