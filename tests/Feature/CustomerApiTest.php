<?php

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_requires_authentication(): void
    {
        $response = $this->getJson('/api/customers');

        $response->assertUnauthorized()
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_index_forbidden_for_normal_user(): void
    {
        $this->actingAsUser();

        $response = $this->getJson('/api/customers');

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Bu işlem için admin yetkisi gereklidir.',
            ]);
    }

    public function test_index_returns_paginated_customers_as_admin(): void
    {
        $this->actingAsAdmin();

        Customer::create([
            'full_name' => 'Ahmet Yılmaz',
            'email' => 'ahmet@example.com',
            'phone' => '05321234567',
        ]);
        Customer::create([
            'full_name' => 'Ayşe Demir',
            'email' => 'ayse@example.com',
            'phone' => null,
        ]);

        $response = $this->getJson('/api/customers');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Müşteriler başarıyla listelendi.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta' => ['current_page', 'per_page', 'total', 'last_page'],
            ])
            ->assertJsonCount(2, 'data');
    }

    public function test_store_requires_authentication(): void
    {
        $response = $this->postJson('/api/customers', [
            'full_name' => 'Mehmet Kaya',
            'email' => 'mehmet@example.com',
            'phone' => '05329998877',
        ]);

        $response->assertUnauthorized()
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_store_forbidden_for_normal_user(): void
    {
        $this->actingAsUser();

        $response = $this->postJson('/api/customers', [
            'full_name' => 'Mehmet Kaya',
            'email' => 'mehmet@example.com',
            'phone' => '05329998877',
        ]);

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Bu işlem için admin yetkisi gereklidir.',
            ]);
    }

    public function test_store_creates_customer_as_admin(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/customers', [
            'full_name' => 'Mehmet Kaya',
            'email' => 'mehmet@example.com',
            'phone' => '05329998877',
        ]);

        $response->assertCreated()
            ->assertJson([
                'success' => true,
                'message' => 'Müşteri başarıyla oluşturuldu.',
                'data' => [
                    'full_name' => 'Mehmet Kaya',
                    'email' => 'mehmet@example.com',
                ],
            ]);

        $this->assertDatabaseHas('customers', ['email' => 'mehmet@example.com']);
    }

    public function test_store_rejects_duplicate_email_as_admin(): void
    {
        $this->actingAsAdmin();

        Customer::create([
            'full_name' => 'Ahmet Yılmaz',
            'email' => 'ahmet@example.com',
            'phone' => null,
        ]);

        $response = $this->postJson('/api/customers', [
            'full_name' => 'Ahmet Kopya',
            'email' => 'ahmet@example.com',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_update_modifies_customer_as_admin(): void
    {
        $this->actingAsAdmin();

        $customer = Customer::create([
            'full_name' => 'Ahmet Yılmaz',
            'email' => 'ahmet@example.com',
            'phone' => null,
        ]);

        $response = $this->putJson("/api/customers/{$customer->id}", [
            'full_name' => 'Ahmet Yılmaz Güncel',
            'phone' => '05321111111',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Müşteri başarıyla güncellendi.',
                'data' => [
                    'full_name' => 'Ahmet Yılmaz Güncel',
                    'phone' => '05321111111',
                ],
            ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'full_name' => 'Ahmet Yılmaz Güncel',
        ]);
    }

    public function test_destroy_deletes_customer_as_admin(): void
    {
        $this->actingAsAdmin();

        $customer = Customer::create([
            'full_name' => 'Silinecek Müşteri',
            'email' => 'delete@example.com',
            'phone' => null,
        ]);

        $response = $this->deleteJson("/api/customers/{$customer->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Müşteri başarıyla silindi.',
                'data' => null,
            ]);

        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
    }
}
