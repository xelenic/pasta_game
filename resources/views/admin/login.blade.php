<x-admin-layout title="Log in">
    <div class="mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-milan-100 sm:p-8">
        <h1 class="text-xl font-semibold text-milan-900">Admin login</h1>
        <p class="mt-1 text-sm text-gray-600">Log in to change the game's difficulty and length.</p>

        <form method="POST" action="{{ route('admin.login.store') }}" class="mt-6 flex flex-col gap-4">
            @csrf

            <div class="flex flex-col gap-1">
                <label for="email" class="text-sm font-medium text-gray-700">Email</label>
                <input id="email" name="email" type="email" value="{{ old('email') }}" required autofocus autocomplete="username"
                    class="rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-milan-600 focus:ring-2 focus:ring-milan-600/30 focus:outline-none">
                @error('email')
                    <p class="text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            <div class="flex flex-col gap-1">
                <label for="password" class="text-sm font-medium text-gray-700">Password</label>
                <input id="password" name="password" type="password" required autocomplete="current-password"
                    class="rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-milan-600 focus:ring-2 focus:ring-milan-600/30 focus:outline-none">
                @error('password')
                    <p class="text-sm text-red-600">{{ $message }}</p>
                @enderror
            </div>

            <button type="submit"
                class="mt-2 cursor-pointer rounded-lg bg-milan-700 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-milan-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-milan-700">
                Log in
            </button>
        </form>
    </div>
</x-admin-layout>
