<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Araç markası modeli.
 * Bir markanın birden fazla arabası olabilir.
 */
class Brand extends Model
{
    protected $fillable = [
        'name',
        'country',
    ];

    /** Markaya ait arabalar */
    public function cars(): HasMany
    {
        return $this->hasMany(Car::class);
    }
}
