<?php

namespace App\Features\Brands\Controllers;

use App\Features\Brands\Requests\IndexBrandRequest;
use App\Features\Brands\Requests\StoreBrandRequest;
use App\Features\Brands\Requests\UpdateBrandRequest;
use App\Features\Brands\Resources\BrandResource;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Shared\Http\ApiResponse;
use App\Shared\Logging\LogContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * @group Brands
 *
 * Marka CRUD API endpointleri.
 */
class BrandController extends Controller
{
    /**
     * List brands
     *
     * Markaları sayfalı olarak listeler.
     *
     * **Auth gerekmez** — public endpoint.
     *
     * @unauthenticated
     *
     * @queryParam per_page integer Sayfa başına kayıt (1-100). Example: 15
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Markalar başarıyla listelendi.",
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "Ford",
     *       "country": "USA",
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
    public function index(IndexBrandRequest $request): JsonResponse
    {
        $perPage = $request->validated()['per_page'] ?? 15;
        $brands = Brand::orderBy('name')->paginate($perPage);

        return ApiResponse::success(
            BrandResource::collection($brands->items())->resolve(),
            'Markalar başarıyla listelendi.',
            200,
            ApiResponse::paginationMeta($brands)
        );
    }

    /**
     * Show brand
     *
     * Tek bir markanın detayını döner.
     *
     * **Auth gerekmez** — public endpoint.
     *
     * @unauthenticated
     *
     * @urlParam brand integer required Marka ID. Example: 1
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Marka başarıyla getirildi.",
     *   "data": {
     *     "id": 1,
     *     "name": "Ford",
     *     "country": "USA",
     *     "created_at": "2026-07-01T12:00:00.000000Z",
     *     "updated_at": "2026-07-01T12:00:00.000000Z"
     *   }
     * }
     * @response 404 scenario="not found" {
     *   "message": "No query results for model [App\\Models\\Brand] 999"
     * }
     */
    public function show(Brand $brand): JsonResponse
    {
        return ApiResponse::success(
            new BrandResource($brand),
            'Marka başarıyla getirildi.'
        );
    }

    /**
     * Create brand
     *
     * Yeni marka oluşturur.
     *
     * **Admin yetkisi gerekir** — Bearer token + `admin` rolü.
     *
     * @authenticated
     *
     * @bodyParam name string required Benzersiz marka adı. Example: Toyota
     * @bodyParam country string nullable Ülke. Example: Japan
     *
     * @response 201 scenario="success" {
     *   "success": true,
     *   "message": "Marka başarıyla oluşturuldu.",
     *   "data": {
     *     "id": 4,
     *     "name": "Toyota",
     *     "country": "Japan",
     *     "created_at": "2026-07-01T12:00:00.000000Z",
     *     "updated_at": "2026-07-01T12:00:00.000000Z"
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
     *   "message": "The name has already been taken.",
     *   "errors": {
     *     "name": ["The name has already been taken."]
     *   }
     * }
     */
    public function store(StoreBrandRequest $request): JsonResponse
    {
        $brand = Brand::create($request->validated());

        Log::info('Brand created', LogContext::actor([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'action' => 'created',
        ]));

        return ApiResponse::created(
            new BrandResource($brand),
            'Marka başarıyla oluşturuldu.'
        );
    }

    /**
     * Update brand
     *
     * Mevcut markayı günceller.
     *
     * **Admin yetkisi gerekir** — Bearer token + `admin` rolü.
     *
     * @authenticated
     *
     * @urlParam brand integer required Marka ID. Example: 1
     *
     * @bodyParam name string optional Yeni marka adı. Example: Ford Motor
     * @bodyParam country string optional Ülke. Example: United States
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Marka başarıyla güncellendi.",
     *   "data": {
     *     "id": 1,
     *     "name": "Ford Motor",
     *     "country": "United States"
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
    public function update(UpdateBrandRequest $request, Brand $brand): JsonResponse
    {
        $brand->update($request->validated());
        $brand->refresh();

        Log::info('Brand updated', LogContext::actor([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'action' => 'updated',
        ]));

        return ApiResponse::success(
            new BrandResource($brand),
            'Marka başarıyla güncellendi.'
        );
    }

    /**
     * Delete brand
     *
     * Markayı siler.
     *
     * **Admin yetkisi gerekir** — Bearer token + `admin` rolü.
     *
     * @authenticated
     *
     * @urlParam brand integer required Marka ID. Example: 1
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Marka başarıyla silindi.",
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
    public function destroy(Brand $brand): JsonResponse
    {
        Log::info('Brand deleted', LogContext::actor([
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'action' => 'deleted',
        ]));

        $brand->delete();

        return ApiResponse::deleted('Marka başarıyla silindi.');
    }
}
