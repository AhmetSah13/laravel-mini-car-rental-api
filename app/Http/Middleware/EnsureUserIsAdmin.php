<?php

namespace App\Http\Middleware;

use App\Shared\Enums\UserRole;
use App\Shared\Http\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sadece admin rolündeki kullanıcılara izin verir.
 */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Unauthenticated.', 401);
        }

        if ($user->role !== UserRole::ADMIN) {
            return ApiResponse::error('Bu işlem için admin yetkisi gereklidir.', 403);
        }

        return $next($request);
    }
}
