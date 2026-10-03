<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

#[Signature('game:admin {email : Email address the admin logs in with} {--name=Admin : Display name for a new account}')]
#[Description('Create a game admin account, or give an existing account admin access and a new password')]
class CreateGameAdmin extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = Str::lower((string) $this->argument('email'));
        $password = (string) $this->secret('Password (at least 8 characters)');
        $confirmation = (string) $this->secret('Confirm password');

        $validator = Validator::make(
            ['email' => $email, 'password' => $password, 'password_confirmation' => $confirmation],
            ['email' => ['required', 'email'], 'password' => ['required', 'confirmed', Password::min(8)]],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = User::firstOrNew(['email' => $email]);
        $user->fill(['name' => $user->name ?? $this->option('name'), 'password' => $password]);
        $user->forceFill(['is_admin' => true])->save();

        $this->info($user->wasRecentlyCreated
            ? "Admin account created for {$email}."
            : "{$email} is now an admin with the new password.");

        return self::SUCCESS;
    }
}
