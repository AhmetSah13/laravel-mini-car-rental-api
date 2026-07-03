<?php

namespace App\Shared\Enums;

enum RentalStatus: string
{
    case ACTIVE = 'active';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    /** Validation ve Rule::in için tüm string değerleri döndürür */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
