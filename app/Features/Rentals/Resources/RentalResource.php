<?php

namespace App\Features\Rentals\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Kiralama API response formatı.
 * customer ve car ilişkileri sade özet olarak döner.
 */
class RentalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'car_id' => $this->car_id,
            'customer_id' => $this->customer_id,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'total_price' => $this->total_price,
            'status' => $this->status?->value ?? $this->status,
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'full_name' => $this->customer->full_name,
                'email' => $this->customer->email,
            ]),
            'car' => $this->whenLoaded('car', fn () => [
                'id' => $this->car->id,
                'plate_number' => $this->car->plate_number,
                'model' => $this->car->model,
                'daily_price' => $this->car->daily_price,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
