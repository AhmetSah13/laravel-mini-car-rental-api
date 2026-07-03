<?php

namespace App\Features\Cars\Services;

use App\Models\Car;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Araç listeleme ve filtreleme iş mantığı.
 */
class CarService
{
    /**
     * Filtrelenmiş ve sıralanmış araç listesini sayfalı döndürür.
     */
    public function list(array $filters): LengthAwarePaginator
    {
        $query = Car::query()->with('brand');

        if (isset($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['min_price'])) {
            $query->where('daily_price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('daily_price', '<=', $filters['max_price']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $perPage = $filters['per_page'] ?? 15;

        return $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage);
    }
}
