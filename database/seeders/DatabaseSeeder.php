<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Car;
use App\Models\Customer;
use App\Models\Rental;
use App\Models\User;
use App\Shared\Enums\CarStatus;
use App\Shared\Enums\RentalStatus;
use App\Shared\Enums\UserRole;
use Illuminate\Database\Seeder;

/**
 * Örnek veri seeder'ı — API'yi test etmek için başlangıç verileri oluşturur.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password',
            'role' => UserRole::ADMIN,
        ]);

        User::create([
            'name' => 'Normal User',
            'email' => 'user@example.com',
            'password' => 'password',
            'role' => UserRole::USER,
        ]);

        // 3 marka oluştur
        $ford = Brand::create(['name' => 'Ford', 'country' => 'USA']);
        $bmw = Brand::create(['name' => 'BMW', 'country' => 'Germany']);
        $toyota = Brand::create(['name' => 'Toyota', 'country' => 'Japan']);

        // Her markaya birkaç araç ekle
        $focus = Car::create([
            'brand_id' => $ford->id,
            'plate_number' => '34ABC123',
            'model' => 'Focus',
            'year' => 2022,
            'daily_price' => 800.00,
            'status' => CarStatus::AVAILABLE,
        ]);

        Car::create([
            'brand_id' => $ford->id,
            'plate_number' => '34DEF456',
            'model' => 'Fiesta',
            'year' => 2021,
            'daily_price' => 600.00,
            'status' => CarStatus::AVAILABLE,
        ]);

        $bmw320 = Car::create([
            'brand_id' => $bmw->id,
            'plate_number' => '06GHI789',
            'model' => '320i',
            'year' => 2023,
            'daily_price' => 1500.00,
            'status' => CarStatus::AVAILABLE,
        ]);

        Car::create([
            'brand_id' => $bmw->id,
            'plate_number' => '06JKL012',
            'model' => 'X3',
            'year' => 2022,
            'daily_price' => 2000.00,
            'status' => CarStatus::MAINTENANCE,
        ]);

        Car::create([
            'brand_id' => $toyota->id,
            'plate_number' => '35MNO345',
            'model' => 'Corolla',
            'year' => 2023,
            'daily_price' => 900.00,
            'status' => CarStatus::AVAILABLE,
        ]);

        Car::create([
            'brand_id' => $toyota->id,
            'plate_number' => '35PQR678',
            'model' => 'Yaris',
            'year' => 2020,
            'daily_price' => 500.00,
            'status' => CarStatus::AVAILABLE,
        ]);

        // 3 müşteri oluştur
        $ahmet = Customer::create([
            'full_name' => 'Ahmet Yılmaz',
            'email' => 'ahmet@example.com',
            'phone' => '05321234567',
        ]);

        $ayse = Customer::create([
            'full_name' => 'Ayşe Demir',
            'email' => 'ayse@example.com',
            'phone' => '05329876543',
        ]);

        Customer::create([
            'full_name' => 'Mehmet Kaya',
            'email' => 'mehmet@example.com',
            'phone' => null,
        ]);

        // Örnek kiralama: Ford Focus, 3 günlük
        Rental::create([
            'car_id' => $focus->id,
            'customer_id' => $ahmet->id,
            'start_date' => '2024-06-01',
            'end_date' => '2024-06-03',
            'total_price' => 2400.00, // 800 * 3 gün
            'status' => RentalStatus::COMPLETED,
        ]);

        // Tamamlanan kiralama sonrası araç tekrar müsait (seeder'da manuel ayar)
        $focus->update(['status' => CarStatus::AVAILABLE]);

        // Aktif örnek kiralama: BMW 320i (tarihler Y-m-d formatında)
        Rental::create([
            'car_id' => $bmw320->id,
            'customer_id' => $ayse->id,
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-03',
            'total_price' => 4500.00, // 1500 * 3 gün
            'status' => RentalStatus::ACTIVE,
        ]);

        $bmw320->update(['status' => CarStatus::RENTED]);
    }
}
