<x-admin-layout title="Game settings">
    <div class="flex flex-col gap-6">
        <div>
            <h1 class="text-2xl font-semibold text-milan-900">Game settings</h1>
            <p class="mt-1 text-sm text-gray-600">Every new game uses these settings as soon as you save. Games already in progress keep their old settings.</p>
        </div>

        @if (session('status'))
            <div role="status" class="rounded-lg border border-milan-600/30 bg-milan-100 px-4 py-3 text-sm font-medium text-milan-800">
                {{ session('status') }}
            </div>
        @endif

        <form method="POST" action="{{ route('admin.settings.update') }}" class="flex flex-col gap-6">
            @csrf
            @method('PUT')

            <section class="flex flex-col gap-1 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-milan-100">
                <label for="duration_seconds" class="text-base font-semibold text-milan-900">Game length</label>
                <p class="text-sm text-gray-600">
                    How long one round lasts, from {{ \App\Models\GameSetting::MIN_DURATION_SECONDS }} to {{ \App\Models\GameSetting::MAX_DURATION_SECONDS }} seconds.
                    Slicing a golden penne still adds 5 seconds.
                </p>
                <div class="mt-3 flex items-center gap-3">
                    <input id="duration_seconds" name="duration_seconds" type="number" inputmode="numeric" required
                        min="{{ \App\Models\GameSetting::MIN_DURATION_SECONDS }}" max="{{ \App\Models\GameSetting::MAX_DURATION_SECONDS }}" step="1"
                        value="{{ old('duration_seconds', $settings->duration_seconds) }}"
                        class="w-28 rounded-lg border border-gray-300 px-3 py-2 text-lg font-semibold shadow-sm focus:border-milan-600 focus:ring-2 focus:ring-milan-600/30 focus:outline-none">
                    <span class="text-sm text-gray-600">seconds</span>
                </div>
                @error('duration_seconds')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </section>

            <fieldset class="flex flex-col gap-1 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-milan-100">
                <legend class="sr-only">Difficulty</legend>
                <p class="text-base font-semibold text-milan-900" aria-hidden="true">Difficulty</p>
                <p class="text-sm text-gray-600">Every round still gets harder as the timer runs down.</p>

                <div class="mt-3 grid gap-3 sm:grid-cols-3">
                    @foreach ($difficulties as $difficulty)
                        <label
                            class="flex cursor-pointer flex-col gap-1 rounded-xl border border-gray-200 p-4 hover:border-milan-600/50 has-checked:border-milan-600 has-checked:bg-milan-50 has-checked:ring-2 has-checked:ring-milan-600/30 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-milan-700">
                            <input type="radio" name="difficulty" value="{{ $difficulty->value }}" class="sr-only"
                                @checked(old('difficulty', $settings->difficulty->value) === $difficulty->value)>
                            <span class="font-semibold text-milan-900">{{ $difficulty->label() }}</span>
                            <span class="text-sm text-gray-600">{{ $difficulty->description() }}</span>
                        </label>
                    @endforeach
                </div>
                @error('difficulty')
                    <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                @enderror
            </fieldset>

            <div class="flex justify-end">
                <button type="submit"
                    class="cursor-pointer rounded-full bg-gold-400 px-6 py-3 font-semibold text-milan-900 shadow-sm ring-1 ring-gold-500 hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-milan-700">
                    Save settings
                </button>
            </div>
        </form>
    </div>
</x-admin-layout>
