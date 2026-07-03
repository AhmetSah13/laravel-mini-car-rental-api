<?php

namespace App\Shared\Logging;

use App\Models\User;
use Illuminate\Http\Request;

/**
 * Structured log context builder — hassas alanları loglamaz.
 */
final class LogContext
{
    public static function auth(Request $request, ?User $user = null, array $extra = []): array
    {
        return self::filter(array_merge([
            'user_id' => $user?->id,
            'email' => $user?->email,
            'role' => $user?->role?->value,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ], $extra));
    }

    public static function actor(array $extra = []): array
    {
        /** @var User|null $user */
        $user = auth()->user();

        return self::filter(array_merge([
            'user_id' => auth()->id(),
            'role' => $user?->role?->value,
        ], $extra));
    }

    private static function filter(array $context): array
    {
        return array_filter($context, fn ($value) => $value !== null && $value !== '');
    }
}
