<?php

namespace App\Shared\Enums;

enum CarStatus: string
{
    case AVAILABLE = 'available';
    case RENTED = 'rented';
    case MAINTENANCE = 'maintenance';

    /** Validation ve Rule::in için tüm string değerleri döndürür */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
