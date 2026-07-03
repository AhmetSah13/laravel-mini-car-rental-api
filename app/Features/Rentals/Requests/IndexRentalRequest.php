<?php

namespace App\Features\Rentals\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Kiralama listeleme query parametreleri validasyonu.
 */
class IndexRentalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
