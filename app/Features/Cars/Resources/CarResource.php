<?php

namespace App\Features\Cars\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Araç API response formatı.
 * brand ilişkisi yüklendiyse sade marka bilgisi de döner.
 */
class CarResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'brand_id' => $this->brand_id,
            'plate_number' => $this->plate_number,
            'model' => $this->model,
            'year' => $this->year,
            'daily_price' => $this->daily_price,
            'status' => $this->status?->value ?? $this->status,
            // İlişki yüklüyse marka özeti (whenLoaded gereksiz sorgu yapmaz)
            'brand' => $this->whenLoaded('brand', fn () => [
                'id' => $this->brand->id,
                'name' => $this->brand->name,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
