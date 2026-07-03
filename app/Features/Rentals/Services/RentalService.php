<?php

namespace App\Features\Rentals\Services;

use App\Models\Car;
use App\Models\Rental;
use App\Shared\Enums\CarStatus;
use App\Shared\Enums\RentalStatus;
use App\Shared\Exceptions\BusinessException;
use App\Shared\Logging\LogContext;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Kiralama iş mantığı servisi.
 * Controller'dan ayrılarak karmaşık kurallar burada toplanır.
 */
class RentalService
{
    /**
     * Yeni kiralama oluşturur.
     * - Araç müsait olmalı
     * - Toplam fiyat otomatik hesaplanır
     * - Araç durumu "rented" yapılır
     */
    public function create(array $data): Rental
    {
        return DB::transaction(function () use ($data) {
            $car = Car::lockForUpdate()->findOrFail($data['car_id']);

            // İş kuralı: sadece müsait araç kiralanabilir
            if ($car->status !== CarStatus::AVAILABLE) {
                Log::warning('Unavailable car rental attempt', LogContext::actor([
                    'car_id' => $car->id,
                    'customer_id' => $data['customer_id'] ?? null,
                    'old_car_status' => $car->status?->value ?? $car->status,
                    'action' => 'rental_attempt',
                ]));

                throw new BusinessException('Seçilen araç şu an kiralanabilir durumda değil.', 400);
            }

            $startDate = Carbon::parse($data['start_date'])->startOfDay();
            $endDate = Carbon::parse($data['end_date'])->startOfDay();

            // Kiralanan gün sayısı (başlangıç ve bitiş günü dahil)
            $rentalDays = (int) $startDate->diffInDays($endDate) + 1;
            $totalPrice = round((float) $car->daily_price * $rentalDays, 2);

            $rental = Rental::create([
                'car_id' => $car->id,
                'customer_id' => $data['customer_id'],
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'total_price' => $totalPrice,
                'status' => $data['status'] ?? RentalStatus::ACTIVE,
            ]);

            // Aracı kirada olarak işaretle
            $car->update(['status' => CarStatus::RENTED]);

            Log::info('Rental created', LogContext::actor([
                'rental_id' => $rental->id,
                'car_id' => $car->id,
                'customer_id' => $rental->customer_id,
                'old_car_status' => CarStatus::AVAILABLE->value,
                'new_car_status' => CarStatus::RENTED->value,
                'rental_status' => $rental->status?->value ?? $rental->status,
                'total_price' => $totalPrice,
                'action' => 'created',
            ]));

            return $rental->load(['car', 'customer']);
        });
    }

    /**
     * Kiralama kaydını günceller.
     * Status cancelled veya completed olursa araç tekrar müsait yapılır.
     */
    public function update(Rental $rental, array $data): Rental
    {
        return DB::transaction(function () use ($rental, $data) {
            $rental = Rental::lockForUpdate()->findOrFail($rental->id);
            $oldStatus = $rental->status;
            $car = Car::find($rental->car_id);
            $oldCarStatus = $car?->status?->value ?? $car?->status;

            $rental->update($data);

            // Durum değiştiyse araç müsaitliğini güncelle
            if (isset($data['status']) && RentalStatus::from($data['status']) !== $oldStatus) {
                $this->syncCarStatusOnRentalChange($rental);
                $car = Car::find($rental->car_id);

                $this->logRentalStatusChange(
                    $rental,
                    RentalStatus::from($data['status']),
                    $car,
                    $oldCarStatus
                );
            }

            return $rental->fresh(['car', 'customer']);
        });
    }

    /**
     * Kiralama silindiğinde (destroy) araç müsait yapılabilir.
     */
    public function delete(Rental $rental): void
    {
        DB::transaction(function () use ($rental) {
            $car = Car::lockForUpdate()->find($rental->car_id);

            $rental->delete();

            // Aktif kiralama silinirse aracı serbest bırak
            if ($car && $car->status === CarStatus::RENTED) {
                $car->update(['status' => CarStatus::AVAILABLE]);
            }
        });
    }

    /**
     * Kiralama durumuna göre araç status'unu senkronize eder.
     */
    private function syncCarStatusOnRentalChange(Rental $rental): void
    {
        $car = Car::lockForUpdate()->find($rental->car_id);

        if (! $car) {
            return;
        }

        if (in_array($rental->status, [RentalStatus::CANCELLED, RentalStatus::COMPLETED], true)) {
            $car->update(['status' => CarStatus::AVAILABLE]);
        }

        if ($rental->status === RentalStatus::ACTIVE) {
            $car->update(['status' => CarStatus::RENTED]);
        }
    }

    private function logRentalStatusChange(
        Rental $rental,
        RentalStatus $newStatus,
        ?Car $car,
        mixed $oldCarStatus
    ): void {
        $context = LogContext::actor([
            'rental_id' => $rental->id,
            'car_id' => $rental->car_id,
            'customer_id' => $rental->customer_id,
            'old_car_status' => $oldCarStatus,
            'new_car_status' => $car?->status?->value ?? $car?->status,
            'rental_status' => $newStatus->value,
            'total_price' => $rental->total_price,
        ]);

        match ($newStatus) {
            RentalStatus::CANCELLED => Log::info('Rental cancelled', array_merge($context, ['action' => 'cancelled'])),
            RentalStatus::COMPLETED => Log::info('Rental completed', array_merge($context, ['action' => 'completed'])),
            default => null,
        };
    }
}
