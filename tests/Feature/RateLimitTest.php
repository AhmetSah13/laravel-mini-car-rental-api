<?php

namespace Tests\Feature;

use App\Models\User;
use App\Shared\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class RateLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['app.rate_limiting_enabled' => true]);
        Cache::flush();
    }

    protected function tearDown(): void
    {
        config(['app.rate_limiting_enabled' => false]);
        Cache::flush();

        parent::tearDown();
    }

    public function test_login_returns_429_after_limit_exceeded(): void
    {
        $email = 'ratelimit-'.uniqid().'@example.com';

        User::create([
            'name' => 'Rate Limit User',
            'email' => $email,
            'password' => 'password',
            'role' => UserRole::USER,
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [
                'email' => $email,
                'password' => 'wrong-password',
            ])->assertUnauthorized();
        }

        $response = $this->postJson('/api/auth/login', [
            'email' => $email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(429)
            ->assertJson([
                'success' => false,
                'message' => 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
            ]);
    }

    public function test_public_cars_endpoint_returns_200(): void
    {
        $response = $this->getJson('/api/cars');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Araçlar başarıyla listelendi.',
            ]);
    }

    public function test_authenticated_endpoint_works_within_limit(): void
    {
        $this->actingAsUser();

        $response = $this->getJson('/api/rentals');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Kiralamalar başarıyla listelendi.',
            ]);
    }
}
