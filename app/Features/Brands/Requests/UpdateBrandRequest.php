<?php

namespace App\Features\Brands\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Marka güncelleme validasyon kuralları.
 * "sometimes" = alan gönderilmişse validate et.
 */
class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('brands', 'name')->ignore($this->route('brand')),
            ],
            'country' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
