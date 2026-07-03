<?php

use App\Features\Auth\Controllers\AuthController;
use App\Features\Brands\Controllers\BrandController;
use App\Features\Cars\Controllers\CarController;
use App\Features\Customers\Controllers\CustomerController;
use App\Features\Rentals\Controllers\RentalController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Mini Araç Kiralama
|--------------------------------------------------------------------------
*/

// Auth — login/register (throttle:auth)
Route::prefix('auth')->group(function () {
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
    });

    Route::middleware(['auth:sanctum', 'throttle:auth-api'])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Brands & Cars — public read (throttle:public-api)
Route::middleware('throttle:public-api')->group(function () {
    Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
    Route::get('/brands/{brand}', [BrandController::class, 'show'])->name('brands.show');

    Route::get('/cars', [CarController::class, 'index'])->name('cars.index');
    Route::get('/cars/{car}', [CarController::class, 'show'])->name('cars.show');
});

// Brands & Cars — admin write (throttle:auth-api)
Route::middleware(['auth:sanctum', 'admin', 'throttle:auth-api'])->group(function () {
    Route::post('/brands', [BrandController::class, 'store'])->name('brands.store');
    Route::put('/brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
    Route::patch('/brands/{brand}', [BrandController::class, 'update']);
    Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');

    Route::post('/cars', [CarController::class, 'store'])->name('cars.store');
    Route::put('/cars/{car}', [CarController::class, 'update'])->name('cars.update');
    Route::patch('/cars/{car}', [CarController::class, 'update']);
    Route::delete('/cars/{car}', [CarController::class, 'destroy'])->name('cars.destroy');
});

// Customers — admin only (throttle:auth-api)
Route::middleware(['auth:sanctum', 'admin', 'throttle:auth-api'])->apiResource('customers', CustomerController::class);

// Rentals — authenticated users and admins (throttle:auth-api)
Route::middleware(['auth:sanctum', 'throttle:auth-api'])->apiResource('rentals', RentalController::class);
