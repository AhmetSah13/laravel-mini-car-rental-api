<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Car;
use App\Shared\Enums\CarStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CarApiTest extends TestCase
{
    use RefreshDatabase;

    private function createBrand(): Brand
    {
        return Brand::create([
            'name' => 'Brand-'.uniqid(),
            'country' => 'USA',
        ]);
    }

    private function createCar(array $overrides = []): Car
    {
        $brand = $overrides['brand'] ?? $this->createBrand();
        unset($overrides['brand']);

        return Car::create(array_merge([
            'brand_id' => $brand->id,
            'plate_number' => '34ABC123',
            'model' => 'Focus',
            'year' => 2022,
            'daily_price' => 800.00,
            'status' => CarStatus::AVAILABLE,
        ], $overrides));
    }

    public function test_index_returns_paginated_cars_without_auth(): void
    {
        $this->createCar(['plate_number' => '34AAA111']);
        $this->createCar(['plate_number' => '34BBB222']);

        $response = $this->getJson('/api/cars');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Araçlar başarıyla listelendi.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta' => ['current_page', 'per_page', 'total', 'last_page'],
            ])
            ->assertJsonCount(2, 'data');
    }

    public function test_index_filters_by_available_status_without_auth(): void
    {
        $this->createCar(['plate_number' => '34AAA111', 'status' => CarStatus::AVAILABLE]);
        $this->createCar(['plate_number' => '34BBB222', 'status' => CarStatus::RENTED]);

        $response = $this->getJson('/api/cars?status=available');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'available');
    }

    public function test_index_supports_sorting_and_pagination_meta_without_auth(): void
    {
        $brand = $this->createBrand();

        foreach ([500, 800, 900, 1000, 1200, 1500] as $index => $price) {
            Car::create([
                'brand_id' => $brand->id,
                'plate_number' => '34PRICE'.$index,
                'model' => 'Test',
                'year' => 2022,
                'daily_price' => $price,
                'status' => CarStatus::AVAILABLE,
            ]);
        }

        $response = $this->getJson('/api/cars?sort_by=daily_price&sort_direction=asc&per_page=5');

        $response->assertOk()
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 5)
            ->assertJsonPath('meta.total', 6)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('data.0.daily_price', '500.00')
            ->assertJsonPath('data.4.daily_price', '1200.00');
    }

    public function test_store_requires_authentication(): void
    {
        $brand = $this->createBrand();

        $response = $this->postJson('/api/cars', [
            'brand_id' => $brand->id,
            'plate_number' => '06NEW001',
            'model' => 'Fiesta',
            'year' => 2023,
            'daily_price' => 650.00,
            'status' => 'available',
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
        $brand = $this->createBrand();

        $response = $this->postJson('/api/cars', [
            'brand_id' => $brand->id,
            'plate_number' => '06NEW001',
            'model' => 'Fiesta',
            'year' => 2023,
            'daily_price' => 650.00,
            'status' => 'available',
        ]);

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Bu işlem için admin yetkisi gereklidir.',
            ]);
    }

    public function test_store_creates_car_as_admin(): void
    {
        $this->actingAsAdmin();
        $brand = $this->createBrand();

        $response = $this->postJson('/api/cars', [
            'brand_id' => $brand->id,
            'plate_number' => '06NEW001',
            'model' => 'Fiesta',
            'year' => 2023,
            'daily_price' => 650.00,
            'status' => 'available',
        ]);

        $response->assertCreated()
            ->assertJson([
                'success' => true,
                'message' => 'Araç başarıyla oluşturuldu.',
                'data' => [
                    'plate_number' => '06NEW001',
                    'model' => 'Fiesta',
                    'status' => 'available',
                ],
            ]);

        $this->assertDatabaseHas('cars', ['plate_number' => '06NEW001']);
    }

    public function test_store_rejects_invalid_brand_id_as_admin(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/cars', [
            'brand_id' => 9999,
            'plate_number' => '06NEW002',
            'model' => 'Fiesta',
            'year' => 2023,
            'daily_price' => 650.00,
            'status' => 'available',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['brand_id']);
    }

    public function test_store_rejects_duplicate_plate_number_as_admin(): void
    {
        $this->actingAsAdmin();
        $car = $this->createCar(['plate_number' => '34DUP001']);

        $response = $this->postJson('/api/cars', [
            'brand_id' => $car->brand_id,
            'plate_number' => '34DUP001',
            'model' => 'Clio',
            'year' => 2021,
            'daily_price' => 500.00,
            'status' => 'available',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['plate_number']);
    }

    public function test_update_requires_authentication(): void
    {
        $car = $this->createCar(['plate_number' => '34UPD001']);

        $response = $this->putJson("/api/cars/{$car->id}", [
            'model' => 'Focus ST',
            'daily_price' => 950.00,
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
        $car = $this->createCar(['plate_number' => '34UPD001']);

        $response = $this->putJson("/api/cars/{$car->id}", [
            'model' => 'Focus ST',
            'daily_price' => 950.00,
        ]);

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Bu işlem için admin yetkisi gereklidir.',
            ]);
    }

    public function test_update_modifies_car_as_admin(): void
    {
        $this->actingAsAdmin();
        $car = $this->createCar(['plate_number' => '34UPD001']);

        $response = $this->putJson("/api/cars/{$car->id}", [
            'model' => 'Focus ST',
            'daily_price' => 950.00,
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Araç başarıyla güncellendi.',
                'data' => [
                    'model' => 'Focus ST',
                    'daily_price' => '950.00',
                ],
            ]);

        $this->assertDatabaseHas('cars', ['id' => $car->id, 'model' => 'Focus ST']);
    }

    public function test_destroy_requires_authentication(): void
    {
        $car = $this->createCar(['plate_number' => '34DEL001']);

        $response = $this->deleteJson("/api/cars/{$car->id}");

        $response->assertUnauthorized()
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_destroy_forbidden_for_normal_user(): void
    {
        $this->actingAsUser();
        $car = $this->createCar(['plate_number' => '34DEL001']);

        $response = $this->deleteJson("/api/cars/{$car->id}");

        $response->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Bu işlem için admin yetkisi gereklidir.',
            ]);
    }

    public function test_destroy_deletes_car_as_admin(): void
    {
        $this->actingAsAdmin();
        $car = $this->createCar(['plate_number' => '34DEL001']);

        $response = $this->deleteJson("/api/cars/{$car->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'Araç başarıyla silindi.',
                'data' => null,
            ]);

        $this->assertDatabaseMissing('cars', ['id' => $car->id]);
    }
}
