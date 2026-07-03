<?php

namespace App\Models;

use App\Shared\Enums\RentalStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Kiralama modeli.
 * Bir kiralama bir araba ve bir müşteriye bağlıdır.
 */
class Rental extends Model
{
    protected $fillable = [
        'car_id',
        'customer_id',
        'start_date',
        'end_date',
        'total_price',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_price' => 'decimal:2',
        'status' => RentalStatus::class,
    ];

    /** Kiralanan araç */
    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    /** Kiralayan müşteri */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
