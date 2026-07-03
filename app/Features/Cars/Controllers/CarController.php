<?php

namespace App\Features\Cars\Controllers;

use App\Events\CarCreated;
use App\Features\Cars\Requests\IndexCarRequest;
use App\Features\Cars\Requests\StoreCarRequest;
use App\Features\Cars\Requests\UpdateCarRequest;
use App\Features\Cars\Resources\CarResource;
use App\Features\Cars\Services\CarService;
use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Shared\Http\ApiResponse;
use App\Shared\Logging\LogContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * @group Cars
 *
 * Araç CRUD API endpointleri. Listeleme filtreleri CarService üzerinden uygulanır.
 */
class CarController extends Controller
{
    public function __construct(
        private readonly CarService $carService
    ) {}

    /**
     * List cars
     *
     * Araçları filtreli ve sayfalı olarak listeler.
     *
     * **Auth gerekmez** — public endpoint.
     *
     * @unauthenticated
     *
     * @queryParam brand_id integer Marka ID ile filtrele. Example: 1
     * @queryParam status string Araç durumu: `available`, `rented`, `maintenance`. Example: available
     * @queryParam min_price number Minimum günlük fiyat. Example: 500
     * @queryParam max_price number Maximum günlük fiyat. Example: 1500
     * @queryParam sort_by string Sıralama alanı: `id`, `daily_price`, `year`, `created_at`. Example: daily_price
     * @queryParam sort_direction string Sıralama yönü: `asc` veya `desc`. Example: asc
     * @queryParam per_page integer Sayfa başına kayıt (1-100). Example: 15
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Araçlar başarıyla listelendi.",
     *   "data": [
     *     {
     *       "id": 1,
     *       "brand_id": 1,
     *       "plate_number": "34ABC123",
     *       "model": "Focus",
     *       "year": 2022,
     *       "daily_price": "800.00",
     *       "status": "available",
     *       "created_at": "2026-07-01T12:00:00.000000Z",
     *       "updated_at": "2026-07-01T12:00:00.000000Z"
     *     }
     *   ],
     *   "meta": {
     *     "current_page": 1,
     *     "per_page": 15,
     *     "total": 1,
     *     "last_page": 1
     *   }
     * }
     */
    public function index(IndexCarRequest $request): JsonResponse
    {
        $cars = $this->carService->list($request->validated());

        return ApiResponse::success(
            CarResource::collection($cars->items())->resolve(),
            'Araçlar başarıyla listelendi.',
            200,
            ApiResponse::paginationMeta($cars)
        );
    }

    /**
     * Show car
     *
     * Tek bir aracın detayını döner (marka bilgisi dahil).
     *
     * **Auth gerekmez** — public endpoint.
     *
     * @unauthenticated
     *
     * @urlParam car integer required Araç ID. Example: 1
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Araç başarıyla getirildi.",
     *   "data": {
     *     "id": 1,
     *     "brand_id": 1,
     *     "plate_number": "34ABC123",
     *     "model": "Focus",
     *     "year": 2022,
     *     "daily_price": "800.00",
     *     "status": "available",
     *     "brand": {
     *       "id": 1,
     *       "name": "Ford"
     *     }
     *   }
     * }
     */
    public function show(Car $car): JsonResponse
    {
        $car->load('brand');

        return ApiResponse::success(
            new CarResource($car),
            'Araç başarıyla getirildi.'
        );
    }

    /**
     * Create car
     *
     * Yeni araç oluşturur.
     *
     * **Admin yetkisi gerekir** — Bearer token + `admin` rolü.
     *
     * @authenticated
     *
     * @bodyParam brand_id integer required Marka ID. Example: 1
     * @bodyParam plate_number string required Benzersiz plaka. Example: 06NEW001
     * @bodyParam model string required Model adı. Example: Fiesta
     * @bodyParam year integer required Model yılı (1990-günümüz). Example: 2023
     * @bodyParam daily_price number required Günlük kiralama fiyatı. Example: 650.00
     * @bodyParam status string required Durum: `available`, `rented`, `maintenance`. Example: available
     *
     * @response 201 scenario="success" {
     *   "success": true,
     *   "message": "Araç başarıyla oluşturuldu.",
     *   "data": {
     *     "id": 5,
     *     "brand_id": 1,
     *     "plate_number": "06NEW001",
     *     "model": "Fiesta",
     *     "year": 2023,
     *     "daily_price": "650.00",
     *     "status": "available"
     *   }
     * }
     * @response 401 scenario="unauthenticated" {
     *   "success": false,
     *   "message": "Unauthenticated."
     * }
     * @response 403 scenario="forbidden" {
     *   "success": false,
     *   "message": "Bu işlem için admin yetkisi gereklidir."
     * }
     * @response 422 scenario="validation error" {
     *   "message": "The plate number has already been taken.",
     *   "errors": {
     *     "plate_number": ["The plate number has already been taken."]
     *   }
     * }
     */
    public function store(StoreCarRequest $request): JsonResponse
    {
        $car = Car::create($request->validated());
        $car->load('brand');

        Log::info('Car created', LogContext::actor([
            'car_id' => $car->id,
            'plate_number' => $car->plate_number,
            'new_status' => $car->status?->value ?? $car->status,
            'action' => 'created',
        ]));

        try {
            broadcast(new CarCreated($car))->toOthers();
        } catch (Throwable $e) {
            // Real-time is progressive enhancement; REST must keep working.
            Log::warning('CarCreated broadcast failed', [
                'car_id' => $car->id,
                'error' => $e->getMessage(),
            ]);
        }

        return ApiResponse::created(
            new CarResource($car),
            'Araç başarıyla oluşturuldu.'
        );
    }

    /**
     * Update car
     *
     * Mevcut aracı günceller.
     *
     * **Admin yetkisi gerekir** — Bearer token + `admin` rolü.
     *
     * @authenticated
     *
     * @urlParam car integer required Araç ID. Example: 1
     *
     * @bodyParam brand_id integer optional Marka ID. Example: 1
     * @bodyParam plate_number string optional Plaka. Example: 34UPD001
     * @bodyParam model string optional Model. Example: Focus ST
     * @bodyParam year integer optional Model yılı. Example: 2023
     * @bodyParam daily_price number optional Günlük fiyat. Example: 950.00
     * @bodyParam status string optional Durum. Example: maintenance
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Araç başarıyla güncellendi.",
     *   "data": {
     *     "id": 1,
     *     "model": "Focus ST",
     *     "daily_price": "950.00"
     *   }
     * }
     * @response 401 scenario="unauthenticated" {
     *   "success": false,
     *   "message": "Unauthenticated."
     * }
     * @response 403 scenario="forbidden" {
     *   "success": false,
     *   "message": "Bu işlem için admin yetkisi gereklidir."
     * }
     */
    public function update(UpdateCarRequest $request, Car $car): JsonResponse
    {
        $oldStatus = $car->status?->value ?? $car->status;
        $car->update($request->validated());
        $car->refresh();
        $car->load('brand');

        Log::info('Car updated', LogContext::actor([
            'car_id' => $car->id,
            'plate_number' => $car->plate_number,
            'old_status' => $oldStatus,
            'new_status' => $car->status?->value ?? $car->status,
            'action' => 'updated',
        ]));

        return ApiResponse::success(
            new CarResource($car),
            'Araç başarıyla güncellendi.'
        );
    }

    /**
     * Delete car
     *
     * Aracı siler.
     *
     * **Admin yetkisi gerekir** — Bearer token + `admin` rolü.
     *
     * @authenticated
     *
     * @urlParam car integer required Araç ID. Example: 1
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Araç başarıyla silindi.",
     *   "data": null
     * }
     * @response 401 scenario="unauthenticated" {
     *   "success": false,
     *   "message": "Unauthenticated."
     * }
     * @response 403 scenario="forbidden" {
     *   "success": false,
     *   "message": "Bu işlem için admin yetkisi gereklidir."
     * }
     */
    public function destroy(Car $car): JsonResponse
    {
        Log::info('Car deleted', LogContext::actor([
            'car_id' => $car->id,
            'plate_number' => $car->plate_number,
            'old_status' => $car->status?->value ?? $car->status,
            'action' => 'deleted',
        ]));

        $car->delete();

        return ApiResponse::deleted('Araç başarıyla silindi.');
    }
}
