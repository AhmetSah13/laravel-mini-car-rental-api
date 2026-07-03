<?php

namespace App\Features\Rentals\Controllers;

use App\Features\Rentals\Requests\IndexRentalRequest;
use App\Features\Rentals\Requests\StoreRentalRequest;
use App\Features\Rentals\Requests\UpdateRentalRequest;
use App\Features\Rentals\Resources\RentalResource;
use App\Features\Rentals\Services\RentalService;
use App\Http\Controllers\Controller;
use App\Models\Rental;
use App\Shared\Http\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * @group Rentals
 *
 * Kiralama CRUD API endpointleri. **Tüm endpointler Bearer token gerektirir** (`auth:sanctum`).
 * Admin ve normal kullanıcı erişebilir.
 */
class RentalController extends Controller
{
    public function __construct(
        private readonly RentalService $rentalService
    ) {}

    /**
     * List rentals
     *
     * Kiralamaları sayfalı olarak listeler.
     *
     * **Bearer token gerekir** — authenticated user veya admin.
     *
     * @authenticated
     *
     * @queryParam per_page integer Sayfa başına kayıt (1-100). Example: 15
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Kiralamalar başarıyla listelendi.",
     *   "data": [
     *     {
     *       "id": 1,
     *       "car_id": 1,
     *       "customer_id": 1,
     *       "start_date": "2026-07-01",
     *       "end_date": "2026-07-03",
     *       "total_price": "300.00",
     *       "status": "active"
     *     }
     *   ],
     *   "meta": {
     *     "current_page": 1,
     *     "per_page": 15,
     *     "total": 1,
     *     "last_page": 1
     *   }
     * }
     * @response 401 scenario="unauthenticated" {
     *   "success": false,
     *   "message": "Unauthenticated."
     * }
     */
    public function index(IndexRentalRequest $request): JsonResponse
    {
        $perPage = $request->validated()['per_page'] ?? 15;
        $rentals = Rental::with(['car', 'customer'])
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return ApiResponse::success(
            RentalResource::collection($rentals->items())->resolve(),
            'Kiralamalar başarıyla listelendi.',
            200,
            ApiResponse::paginationMeta($rentals)
        );
    }

    /**
     * Show rental
     *
     * Tek bir kiralamanın detayını döner (araç ve müşteri özeti dahil).
     *
     * **Bearer token gerekir** — authenticated user veya admin.
     *
     * @authenticated
     *
     * @urlParam rental integer required Kiralama ID. Example: 1
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Kiralama başarıyla getirildi.",
     *   "data": {
     *     "id": 1,
     *     "car_id": 1,
     *     "customer_id": 1,
     *     "start_date": "2026-07-01",
     *     "end_date": "2026-07-03",
     *     "total_price": "300.00",
     *     "status": "active",
     *     "car": {
     *       "id": 1,
     *       "plate_number": "34ABC123",
     *       "model": "Focus",
     *       "daily_price": "800.00"
     *     },
     *     "customer": {
     *       "id": 1,
     *       "full_name": "Ahmet Yılmaz",
     *       "email": "ahmet@example.com"
     *     }
     *   }
     * }
     * @response 401 scenario="unauthenticated" {
     *   "success": false,
     *   "message": "Unauthenticated."
     * }
     */
    public function show(Rental $rental): JsonResponse
    {
        $rental->load(['car', 'customer']);

        return ApiResponse::success(
            new RentalResource($rental),
            'Kiralama başarıyla getirildi.'
        );
    }

    /**
     * Create rental
     *
     * Yeni kiralama oluşturur. Toplam fiyat otomatik hesaplanır, araç `rented` durumuna geçer.
     *
     * **Bearer token gerekir** — authenticated user veya admin.
     *
     * @authenticated
     *
     * @bodyParam car_id integer required Kiralanacak araç ID (available olmalı). Example: 1
     * @bodyParam customer_id integer required Müşteri ID. Example: 1
     * @bodyParam start_date string required Başlangıç tarihi (Y-m-d). Example: 2026-07-01
     * @bodyParam end_date string required Bitiş tarihi (Y-m-d, start_date'den önce olamaz). Example: 2026-07-03
     * @bodyParam status string optional Durum: `active`, `completed`, `cancelled`. Example: active
     *
     * @response 201 scenario="success" {
     *   "success": true,
     *   "message": "Kiralama başarıyla oluşturuldu.",
     *   "data": {
     *     "id": 1,
     *     "car_id": 1,
     *     "customer_id": 1,
     *     "start_date": "2026-07-01",
     *     "end_date": "2026-07-03",
     *     "total_price": "300.00",
     *     "status": "active"
     *   }
     * }
     * @response 400 scenario="business error" {
     *   "success": false,
     *   "message": "Seçilen araç şu an kiralanabilir durumda değil."
     * }
     * @response 401 scenario="unauthenticated" {
     *   "success": false,
     *   "message": "Unauthenticated."
     * }
     * @response 422 scenario="validation error" {
     *   "message": "The end date field must be a date after or equal to start date.",
     *   "errors": {
     *     "end_date": ["The end date field must be a date after or equal to start date."]
     *   }
     * }
     */
    public function store(StoreRentalRequest $request): JsonResponse
    {
        $rental = $this->rentalService->create($request->validated());

        return ApiResponse::created(
            new RentalResource($rental),
            'Kiralama başarıyla oluşturuldu.'
        );
    }

    /**
     * Update rental
     *
     * Kiralamayı günceller. Durum `cancelled` veya `completed` olursa araç tekrar `available` yapılır.
     *
     * **Bearer token gerekir** — authenticated user veya admin.
     *
     * @authenticated
     *
     * @urlParam rental integer required Kiralama ID. Example: 1
     *
     * @bodyParam car_id integer optional Araç ID. Example: 1
     * @bodyParam customer_id integer optional Müşteri ID. Example: 1
     * @bodyParam start_date string optional Başlangıç tarihi. Example: 2026-07-01
     * @bodyParam end_date string optional Bitiş tarihi. Example: 2026-07-05
     * @bodyParam status string optional Durum: `active`, `completed`, `cancelled`. Example: completed
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Kiralama başarıyla güncellendi.",
     *   "data": {
     *     "id": 1,
     *     "status": "completed"
     *   }
     * }
     * @response 401 scenario="unauthenticated" {
     *   "success": false,
     *   "message": "Unauthenticated."
     * }
     */
    public function update(UpdateRentalRequest $request, Rental $rental): JsonResponse
    {
        $rental = $this->rentalService->update($rental, $request->validated());

        return ApiResponse::success(
            new RentalResource($rental),
            'Kiralama başarıyla güncellendi.'
        );
    }

    /**
     * Delete rental
     *
     * Kiralamayı siler.
     *
     * **Bearer token gerekir** — authenticated user veya admin.
     *
     * @authenticated
     *
     * @urlParam rental integer required Kiralama ID. Example: 1
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Kiralama başarıyla silindi.",
     *   "data": null
     * }
     * @response 401 scenario="unauthenticated" {
     *   "success": false,
     *   "message": "Unauthenticated."
     * }
     */
    public function destroy(Rental $rental): JsonResponse
    {
        $this->rentalService->delete($rental);

        return ApiResponse::deleted('Kiralama başarıyla silindi.');
    }
}
