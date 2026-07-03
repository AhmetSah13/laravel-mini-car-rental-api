<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

/**
 * API rate limiter tanımları.
 */
class ConfigureRateLimiting
{
    public static function configure(): void
    {
        RateLimiter::for('auth', function (Request $request) {
            if (self::disabled()) {
                return Limit::none();
            }

            $key = $request->routeIs('auth.login')
                ? 'login|'.strtolower((string) $request->input('email')).'|'.$request->ip()
                : 'register|'.$request->ip();

            return Limit::perMinute(5)->by($key);
        });

        RateLimiter::for('public-api', function (Request $request) {
            if (self::disabled()) {
                return Limit::none();
            }

            return Limit::perMinute(60)->by($request->ip());
        });

        RateLimiter::for('auth-api', function (Request $request) {
            if (self::disabled()) {
                return Limit::none();
            }

            return Limit::perMinute(120)->by(
                $request->user()?->getAuthIdentifier() ?: $request->ip()
            );
        });
    }

    private static function disabled(): bool
    {
        return app()->environment('testing')
            && ! config('app.rate_limiting_enabled', false);
    }
}
