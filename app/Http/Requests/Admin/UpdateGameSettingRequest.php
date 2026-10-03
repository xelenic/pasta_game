<?php

namespace App\Http\Requests\Admin;

use App\GameDifficulty;
use App\Models\GameSetting;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGameSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('manage-game-settings') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'duration_seconds' => ['required', 'integer', 'between:'.GameSetting::MIN_DURATION_SECONDS.','.GameSetting::MAX_DURATION_SECONDS],
            'difficulty' => ['required', Rule::enum(GameDifficulty::class)],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'duration_seconds.between' => 'The game length must be between :min and :max seconds.',
            'difficulty.enum' => 'Choose Easy, Normal or Hard.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'duration_seconds' => 'game length',
        ];
    }
}
