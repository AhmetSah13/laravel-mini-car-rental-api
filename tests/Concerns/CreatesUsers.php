<?php

namespace Tests\Concerns;

use App\Models\User;
use App\Shared\Enums\UserRole;
use Laravel\Sanctum\Sanctum;

trait CreatesUsers
{
    protected function createAdminUser(array $overrides = []): User
    {
        return User::create(array_merge([
            'name' => 'Admin User',
            'email' => 'admin'.uniqid().'@example.com',
            'password' => 'password',
            'role' => UserRole::ADMIN,
        ], $overrides));
    }

    protected function createNormalUser(array $overrides = []): User
    {
        return User::create(array_merge([
            'name' => 'Normal User',
            'email' => 'user'.uniqid().'@example.com',
            'password' => 'password',
            'role' => UserRole::USER,
        ], $overrides));
    }

    protected function actingAsAdmin(?User $user = null): User
    {
        $user ??= $this->createAdminUser();
        Sanctum::actingAs($user, ['*']);

        return $user;
    }

    protected function actingAsUser(?User $user = null): User
    {
        $user ??= $this->createNormalUser();
        Sanctum::actingAs($user, ['*']);

        return $user;
    }
}
