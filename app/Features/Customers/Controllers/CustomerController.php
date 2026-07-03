<?php

namespace App\Features\Customers\Controllers;

use App\Features\Customers\Requests\IndexCustomerRequest;
use App\Features\Customers\Requests\StoreCustomerRequest;
use App\Features\Customers\Requests\UpdateCustomerRequest;
use App\Features\Customers\Resources\CustomerResource;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Shared\Http\ApiResponse;
use App\Shared\Logging\LogContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * @group Customers
 *
 * Müşteri CRUD API endpointleri. **Tüm endpointler admin yetkisi gerektirir.**
 */
class CustomerController extends Controller
{
    /**
     * List customers
     *
     * Müşterileri sayfalı olarak listeler.
     *
     * **Admin yetkisi gerekir** — Bearer token + `admin` rolü.
     *
     * @authenticated
     *
     * @queryParam per_page integer Sayfa başına kayıt (1-100). Example: 15
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Müşteriler başarıyla listelendi.",
     *   "data": [
     *     {
     *       "id": 1,
     *       "full_name": "Ahmet Yılmaz",
     *       "email": "ahmet@example.com",
     *       "phone": "05321234567"
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
     * @response 403 scenario="forbidden" {
     *   "success": false,
     *   "message": "Bu işlem için admin yetkisi gereklidir."
     * }
     */
    public function index(IndexCustomerRequest $request): JsonResponse
    {
        $perPage = $request->validated()['per_page'] ?? 15;
        $customers = Customer::orderBy('full_name')->paginate($perPage);

        return ApiResponse::success(
            CustomerResource::collection($customers->items())->resolve(),
            'Müşteriler başarıyla listelendi.',
            200,
            ApiResponse::paginationMeta($customers)
        );
    }

    /**
     * Show customer
     *
     * Tek bir müşterinin detayını döner.
     *
     * **Admin yetkisi gerekir** — Bearer token + `admin` rolü.
     *
     * @authenticated
     *
     * @urlParam customer integer required Müşteri ID. Example: 1
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Müşteri başarıyla getirildi.",
     *   "data": {
     *     "id": 1,
     *     "full_name": "Ahmet Yılmaz",
     *     "email": "ahmet@example.com",
     *     "phone": "05321234567"
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
    public function show(Customer $customer): JsonResponse
    {
        return ApiResponse::success(
            new CustomerResource($customer),
            'Müşteri başarıyla getirildi.'
        );
    }

    /**
     * Create customer
     *
     * Yeni müşteri oluşturur.
     *
     * **Admin yetkisi gerekir** — Bearer token + `admin` rolü.
     *
     * @authenticated
     *
     * @bodyParam full_name string required Ad soyad. Example: Mehmet Kaya
     * @bodyParam email string required Benzersiz e-posta. Example: mehmet@example.com
     * @bodyParam phone string optional Telefon numarası. Example: 05329998877
     *
     * @response 201 scenario="success" {
     *   "success": true,
     *   "message": "Müşteri başarıyla oluşturuldu.",
     *   "data": {
     *     "id": 2,
     *     "full_name": "Mehmet Kaya",
     *     "email": "mehmet@example.com",
     *     "phone": "05329998877"
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
     *   "message": "The email has already been taken.",
     *   "errors": {
     *     "email": ["The email has already been taken."]
     *   }
     * }
     */
    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = Customer::create($request->validated());

        Log::info('Customer created', LogContext::actor([
            'customer_id' => $customer->id,
            'email' => $customer->email,
            'action' => 'created',
        ]));

        return ApiResponse::created(
            new CustomerResource($customer),
            'Müşteri başarıyla oluşturuldu.'
        );
    }

    /**
     * Update customer
     *
     * Mevcut müşteriyi günceller.
     *
     * **Admin yetkisi gerekir** — Bearer token + `admin` rolü.
     *
     * @authenticated
     *
     * @urlParam customer integer required Müşteri ID. Example: 1
     *
     * @bodyParam full_name string optional Ad soyad. Example: Ahmet Yılmaz Güncel
     * @bodyParam email string optional E-posta. Example: ahmet@example.com
     * @bodyParam phone string optional Telefon. Example: 05321111111
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Müşteri başarıyla güncellendi.",
     *   "data": {
     *     "id": 1,
     *     "full_name": "Ahmet Yılmaz Güncel",
     *     "phone": "05321111111"
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
    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        $customer->update($request->validated());
        $customer->refresh();

        Log::info('Customer updated', LogContext::actor([
            'customer_id' => $customer->id,
            'email' => $customer->email,
            'action' => 'updated',
        ]));

        return ApiResponse::success(
            new CustomerResource($customer),
            'Müşteri başarıyla güncellendi.'
        );
    }

    /**
     * Delete customer
     *
     * Müşteriyi siler.
     *
     * **Admin yetkisi gerekir** — Bearer token + `admin` rolü.
     *
     * @authenticated
     *
     * @urlParam customer integer required Müşteri ID. Example: 1
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Müşteri başarıyla silindi.",
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
    public function destroy(Customer $customer): JsonResponse
    {
        Log::info('Customer deleted', LogContext::actor([
            'customer_id' => $customer->id,
            'email' => $customer->email,
            'action' => 'deleted',
        ]));

        $customer->delete();

        return ApiResponse::deleted('Müşteri başarıyla silindi.');
    }
}
