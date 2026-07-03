<?php

use App\Shared\Exceptions\BusinessException;
use App\Shared\Http\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (BusinessException $e, Request $request) {
            return ApiResponse::error(
                $e->getMessage(),
                $e->getStatusCode(),
                $e->getErrors()
            );
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error('Unauthenticated.', 401);
            }
        });

        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                Log::warning('Rate limit exceeded', [
                    'ip_address' => $request->ip(),
                    'user_id' => $request->user()?->getAuthIdentifier(),
                    'path' => $request->path(),
                    'method' => $request->method(),
                ]);

                return ApiResponse::error(
                    'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
                    429
                );
            }
        });
    })->create();
