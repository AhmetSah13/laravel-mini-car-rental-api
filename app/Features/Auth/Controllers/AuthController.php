<?php

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Requests\LoginRequest;
use App\Features\Auth\Requests\RegisterRequest;
use App\Features\Auth\Resources\UserResource;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Shared\Enums\UserRole;
use App\Shared\Http\ApiResponse;
use App\Shared\Logging\LogContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

/**
 * @group Authentication
 *
 * Laravel Sanctum ile token tabanlı kimlik doğrulama endpointleri.
 * Token, `Authorization: Bearer {token}` header'ı ile kullanılır.
 */
class AuthController extends Controller
{
    /**
     * Register
     *
     * Yeni kullanıcı kaydı oluşturur ve API token üretir. Varsayılan rol `user` olur.
     *
     * **Auth gerekmez** — public endpoint.
     *
     * @unauthenticated
     *
     * @bodyParam name string required Kullanıcı adı. Example: Ahmet
     * @bodyParam email string required Benzersiz e-posta adresi. Example: ahmet@example.com
     * @bodyParam password string required En az 8 karakter. Example: password
     * @bodyParam password_confirmation string required Şifre tekrarı. Example: password
     *
     * @response 201 scenario="success" {
     *   "success": true,
     *   "message": "Kayıt başarılı.",
     *   "data": {
     *     "user": {
     *       "id": 1,
     *       "name": "Ahmet",
     *       "email": "ahmet@example.com",
     *       "role": "user",
     *       "created_at": "2026-07-01T12:00:00.000000Z",
     *       "updated_at": "2026-07-01T12:00:00.000000Z"
     *     },
     *     "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
     *   }
     * }
     * @response 422 scenario="validation error" {
     *   "message": "The email has already been taken.",
     *   "errors": {
     *     "email": ["The email has already been taken."]
     *   }
     * }
     * @response 429 scenario="rate limit" {
     *   "success": false,
     *   "message": "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin."
     * }
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'role' => UserRole::USER,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        Log::info('User registered', LogContext::auth($request, $user));

        return ApiResponse::created([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Kayıt başarılı.');
    }

    /**
     * Login
     *
     * E-posta ve şifre ile giriş yapar, yeni API token üretir.
     *
     * **Auth gerekmez** — public endpoint.
     *
     * @unauthenticated
     *
     * @bodyParam email string required Kayıtlı e-posta adresi. Example: user@example.com
     * @bodyParam password string required Kullanıcı şifresi. Example: password
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Giriş başarılı.",
     *   "data": {
     *     "user": {
     *       "id": 2,
     *       "name": "Normal User",
     *       "email": "user@example.com",
     *       "role": "user"
     *     },
     *     "token": "2|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
     *   }
     * }
     * @response 401 scenario="invalid credentials" {
     *   "success": false,
     *   "message": "Email veya şifre hatalı."
     * }
     * @response 429 scenario="rate limit" {
     *   "success": false,
     *   "message": "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin."
     * }
     * @response 422 scenario="validation error" {
     *   "message": "The email field is required.",
     *   "errors": {
     *     "email": ["The email field is required."]
     *   }
     * }
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            Log::warning('Failed login attempt', LogContext::auth($request, extra: [
                'email' => $request->validated('email'),
            ]));

            return ApiResponse::error('Email veya şifre hatalı.', 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        Log::info('User logged in', LogContext::auth($request, $user));

        return ApiResponse::success([
            'user' => new UserResource($user),
            'token' => $token,
        ], 'Giriş başarılı.');
    }

    /**
     * Me
     *
     * Giriş yapmış kullanıcının bilgilerini döner.
     *
     * **Bearer token gerekir** (`auth:sanctum`).
     *
     * @authenticated
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Kullanıcı bilgisi getirildi.",
     *   "data": {
     *     "id": 1,
     *     "name": "Ahmet",
     *     "email": "ahmet@example.com",
     *     "role": "user",
     *     "created_at": "2026-07-01T12:00:00.000000Z",
     *     "updated_at": "2026-07-01T12:00:00.000000Z"
     *   }
     * }
     * @response 401 scenario="unauthenticated" {
     *   "success": false,
     *   "message": "Unauthenticated."
     * }
     */
    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(
            new UserResource($request->user()),
            'Kullanıcı bilgisi getirildi.'
        );
    }

    /**
     * Logout
     *
     * Mevcut access token'ı iptal eder (silinir).
     *
     * **Bearer token gerekir** (`auth:sanctum`).
     *
     * @authenticated
     *
     * @response 200 scenario="success" {
     *   "success": true,
     *   "message": "Çıkış başarılı.",
     *   "data": null
     * }
     * @response 401 scenario="unauthenticated" {
     *   "success": false,
     *   "message": "Unauthenticated."
     * }
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        Log::info('User logged out', LogContext::auth($request, $user));

        return ApiResponse::success(null, 'Çıkış başarılı.');
    }
}
