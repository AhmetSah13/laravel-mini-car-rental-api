<?php

namespace App\Models;

use App\Shared\Enums\CarStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Araç modeli.
 * Her araba bir markaya ait olur ve birden fazla kiralama kaydı olabilir.
 */
class Car extends Model
{
    protected $fillable = [
        'brand_id',
        'plate_number',
        'model',
        'year',
        'daily_price',
        'status',
    ];

    protected $casts = [
        'year' => 'integer',
        'daily_price' => 'decimal:2',
        'status' => CarStatus::class,
    ];

    /** Aracın markası */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /** Bu araca ait kiralama kayıtları */
    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }
}
