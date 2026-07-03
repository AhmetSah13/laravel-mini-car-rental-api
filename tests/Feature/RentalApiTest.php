<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Car;
use App\Models\Customer;
use App\Models\Rental;
use App\Shared\Enums\CarStatus;
use App\Shared\Enums\RentalStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RentalApiTest extends TestCase
{
    use RefreshDatabase;

    private function createAvailableCar(float $dailyPrice = 100.00): Car
    {
        $brand = Brand::create(['name' => 'Ford', 'country' => 'USA']);

        return Car::create([
            'brand_id' => $brand->id,
            'plate_number' => '34RENT'.uniqid(),
            'model' => 'Focus',
            'year' => 2022,
            'daily_price' => $dailyPrice,
            'status' => CarStatus::AVAILABLE,
        ]);
    }

    private function createCustomer(): Customer
    {
        return Customer::create([
            'full_name' => 'Test Müşteri',
            'email' => 'test'.uniqid().'@example.com',
            'phone' => null,
        ]);
    }

    public function test_rental_endpoints_require_authentication(): void
    {
        $car = $this->createAvailableCar();
        $customer = $this->createCustomer();

        $response = $this->postJson('/api/rentals', [
            'car_id' => $car->id,
            'customer_id' => $customer->id,
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-03',
        ]);

        $response->assertUnauthorized()
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_store_creates_rental_and_marks_car_as_rented_as_user(): void
    {
        $this->actingAsUser();
        $car = $this->createAvailableCar(100.00);
        $customer = $this->createCustomer();

        $response = $this->postJson('/api/rentals', [
            'car_id' => $car->id,
            'customer_id' => $customer->id,
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-03',
        ]);

        $response->assertCreated()
            ->assertJson([
                'success' => true,
                'message' => 'Kiralama başarıyla oluşturuldu.',
                'data' => [
                    'car_id' => $car->id,
                    'customer_id' => $customer->id,
                    'total_price' => '300.00',
                    'status' => 'active',
                ],
            ]);

        $this->assertDatabaseHas('rentals', [
            'car_id' => $car->id,
            'customer_id' => $customer->id,
            'total_price' => 300.00,
        ]);

        $car->refresh();
        $this->assertSame(CarStatus::RENTED, $car->status);
    }

    public function test_store_creates_rental_as_admin(): void
    {
        $this->actingAsAdmin();
        $car = $this->createAvailableCar(100.00);
        $customer = $this->createCustomer();

        $response = $this->postJson('/api/rentals', [
            'car_id' => $car->id,
            'customer_id' => $customer->id,
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-03',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.total_price', '300.00');
    }

    public function test_store_rejects_renting_unavailable_car_as_user(): void
    {
        $this->actingAsUser();
        $car = $this->createAvailableCar();
        $customer = $this->createCustomer();

        $car->update(['status' => CarStatus::RENTED]);

        $response = $this->postJson('/api/rentals', [
            'car_id' => $car->id,
            'customer_id' => $customer->id,
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-03',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Seçilen araç şu an kiralanabilir durumda değil.',
            ]);
    }

    public function test_update_to_cancelled_makes_car_available_as_user(): void
    {
        $this->actingAsUser();
        $car = $this->createAvailableCar();
        $customer = $this->createCustomer();

        $rental = Rental::create([
            'car_id' => $car->id,
            'customer_id' => $customer->id,
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-03',
            'total_price' => 300.00,
            'status' => RentalStatus::ACTIVE,
        ]);
        $car->update(['status' => CarStatus::RENTED]);

        $response = $this->putJson("/api/rentals/{$rental->id}", [
            'status' => 'cancelled',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $car->refresh();
        $this->assertSame(CarStatus::AVAILABLE, $car->status);
    }

    public function test_update_to_completed_makes_car_available_as_user(): void
    {
        $this->actingAsUser();
        $car = $this->createAvailableCar();
        $customer = $this->createCustomer();

        $rental = Rental::create([
            'car_id' => $car->id,
            'customer_id' => $customer->id,
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-03',
            'total_price' => 300.00,
            'status' => RentalStatus::ACTIVE,
        ]);
        $car->update(['status' => CarStatus::RENTED]);

        $response = $this->putJson("/api/rentals/{$rental->id}", [
            'status' => 'completed',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $car->refresh();
        $this->assertSame(CarStatus::AVAILABLE, $car->status);
    }

    public function test_store_rejects_end_date_before_start_date_as_user(): void
    {
        $this->actingAsUser();
        $car = $this->createAvailableCar();
        $customer = $this->createCustomer();

        $response = $this->postJson('/api/rentals', [
            'car_id' => $car->id,
            'customer_id' => $customer->id,
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-05',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['end_date']);
    }

    public function test_store_calculates_total_price_correctly_as_user(): void
    {
        $this->actingAsUser();
        $car = $this->createAvailableCar(150.00);
        $customer = $this->createCustomer();

        // 5 gün: 2026-07-01 .. 2026-07-05 => 150 * 5 = 750
        $response = $this->postJson('/api/rentals', [
            'car_id' => $car->id,
            'customer_id' => $customer->id,
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-05',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.total_price', '750.00');

        $this->assertDatabaseHas('rentals', [
            'car_id' => $car->id,
            'total_price' => 750.00,
        ]);
    }
}
