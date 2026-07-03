<?php

namespace Tests\Feature;

use App\Models\Brand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BrandApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_paginated_brands_without_auth(): void
    {
        Brand::create(['name' => 'Ford', 'country' => 'USA']);
        Brand::create(['name' => 'BMW', 'country' => 'Germany']);

        $response = $this->getJson('/api/brands');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Markalar başarıyla listelendi.',
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
        $response = $this->postJson('/api/brands', [
            'name' => 'Toyota',
            'country' => 'Japan',
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

        $response = $this->postJson('/api/brands', [
            'name' => 'Toyota',
            'country' => 'Japan',
        ]);

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Bu işlem için admin yetkisi gereklidir.',
            ]);
    }

    public function test_store_creates_brand_as_admin(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/brands', [
            'name' => 'Toyota',
            'country' => 'Japan',
        ]);

        $response->assertCreated()
            ->assertJson([
                'success' => true,
                'message' => 'Marka başarıyla oluşturuldu.',
                'data' => [
                    'name' => 'Toyota',
                    'country' => 'Japan',
                ],
            ]);

        $this->assertDatabaseHas('brands', ['name' => 'Toyota']);
    }

    public function test_store_rejects_duplicate_name_as_admin(): void
    {
        $this->actingAsAdmin();
        Brand::create(['name' => 'Ford', 'country' => 'USA']);

        $response = $this->postJson('/api/brands', [
            'name' => 'Ford',
            'country' => 'USA',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_show_returns_single_brand_without_auth(): void
    {
        $brand = Brand::create(['name' => 'Ford', 'country' => 'USA']);

        $response = $this->getJson("/api/brands/{$brand->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Marka başarıyla getirildi.',
                'data' => [
                    'id' => $brand->id,
                    'name' => 'Ford',
                    'country' => 'USA',
                ],
            ]);
    }

    public function test_update_requires_authentication(): void
    {
        $brand = Brand::create(['name' => 'Ford', 'country' => 'USA']);

        $response = $this->putJson("/api/brands/{$brand->id}", [
            'name' => 'Ford Motor',
            'country' => 'United States',
        ]);

        $response->assertUnauthorized()
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_update_forbidden_for_normal_user(): void
    {
        $this->actingAsUser();
        $brand = Brand::create(['name' => 'Ford', 'country' => 'USA']);

        $response = $this->putJson("/api/brands/{$brand->id}", [
            'name' => 'Ford Motor',
            'country' => 'United States',
        ]);

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Bu işlem için admin yetkisi gereklidir.',
            ]);
    }

    public function test_update_modifies_brand_as_admin(): void
    {
        $this->actingAsAdmin();
        $brand = Brand::create(['name' => 'Ford', 'country' => 'USA']);

        $response = $this->putJson("/api/brands/{$brand->id}", [
            'name' => 'Ford Motor',
            'country' => 'United States',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Marka başarıyla güncellendi.',
                'data' => [
                    'name' => 'Ford Motor',
                    'country' => 'United States',
                ],
            ]);

        $this->assertDatabaseHas('brands', ['id' => $brand->id, 'name' => 'Ford Motor']);
    }

    public function test_destroy_requires_authentication(): void
    {
        $brand = Brand::create(['name' => 'Ford', 'country' => 'USA']);

        $response = $this->deleteJson("/api/brands/{$brand->id}");

        $response->assertUnauthorized()
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_destroy_forbidden_for_normal_user(): void
    {
        $this->actingAsUser();
        $brand = Brand::create(['name' => 'Ford', 'country' => 'USA']);

        $response = $this->deleteJson("/api/brands/{$brand->id}");

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Bu işlem için admin yetkisi gereklidir.',
            ]);
    }

    public function test_destroy_deletes_brand_as_admin(): void
    {
        $this->actingAsAdmin();
        $brand = Brand::create(['name' => 'Ford', 'country' => 'USA']);

        $response = $this->deleteJson("/api/brands/{$brand->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Marka başarıyla silindi.',
                'data' => null,
            ]);

        $this->assertDatabaseMissing('brands', ['id' => $brand->id]);
    }
}
