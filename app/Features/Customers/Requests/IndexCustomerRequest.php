<?php

namespace App\Features\Customers\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Müşteri listeleme query parametreleri validasyonu.
 */
class IndexCustomerRequest extends FormRequest
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
