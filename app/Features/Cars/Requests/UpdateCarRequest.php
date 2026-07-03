<?php

namespace App\Features\Cars\Requests;

use App\Shared\Enums\CarStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Araç güncelleme validasyon kuralları.
 */
class UpdateCarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand_id' => ['sometimes', 'required', 'exists:brands,id'],
            'plate_number' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('cars', 'plate_number')->ignore($this->route('car')),
            ],
            'model' => ['sometimes', 'required', 'string', 'max:255'],
            'year' => ['sometimes', 'required', 'integer', 'min:1990', 'max:'.date('Y')],
            'daily_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'status' => ['sometimes', 'required', Rule::in(CarStatus::values())],
        ];
    }
}
