<?php

namespace Tests\Feature;

use App\Models\User;
use App\Shared\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Ahmet',
            'email' => 'ahmet@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertCreated()
            ->assertJson([
                'success' => true,
                'message' => 'Kayıt başarılı.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'role'],
                    'token',
                ],
            ])
            ->assertJsonPath('data.user.role', 'user');

        $this->assertDatabaseHas('users', [
            'email' => 'ahmet@example.com',
            'role' => UserRole::USER->value,
        ]);
    }

    public function test_login_returns_token(): void
    {
        User::create([
            'name' => 'Ahmet',
            'email' => 'ahmet@example.com',
            'password' => 'password',
            'role' => UserRole::USER,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'ahmet@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Giriş başarılı.',
            ])
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'role'],
                    'token',
                ],
            ]);
    }

    public function test_login_rejects_invalid_credentials_with_401(): void
    {
        User::create([
            'name' => 'Ahmet',
            'email' => 'ahmet@example.com',
            'password' => 'password',
            'role' => UserRole::USER,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'ahmet@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertUnauthorized()
            ->assertJson([
                'success' => false,
                'message' => 'Email veya şifre hatalı.',
            ]);
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = $this->actingAsUser();

        $response = $this->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role' => 'user',
                ],
            ]);
    }

    public function test_logout_revokes_current_token(): void
    {
        $user = User::create([
            'name' => 'Ahmet',
            'email' => 'ahmet@example.com',
            'password' => 'password',
            'role' => UserRole::USER,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/auth/logout');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Çıkış başarılı.',
            ]);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class,
        ]);
    }
}
