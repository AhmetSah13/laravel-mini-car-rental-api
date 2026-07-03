<?php

namespace App\Features\Brands\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Marka listeleme query parametreleri validasyonu.
 */
class IndexBrandRequest extends FormRequest
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
