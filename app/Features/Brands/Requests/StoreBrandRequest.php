<?php

namespace App\Features\Brands\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Yeni marka oluşturma validasyon kuralları.
 */
class StoreBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:brands,name'],
            'country' => ['nullable', 'string', 'max:255'],
        ];
    }
}
