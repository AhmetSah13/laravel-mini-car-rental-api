<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Müşteri modeli.
 * Bir müşterinin birden fazla kiralama kaydı olabilir.
 */
class Customer extends Model
{
    protected $fillable = [
        'full_name',
        'email',
        'phone',
    ];

    /** Müşterinin kiralama kayıtları */
    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }
}
