<?php

namespace App\Features\Cars\Requests;

use App\Shared\Enums\CarStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Yeni araç oluşturma validasyon kuralları.
 */
class StoreCarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand_id' => ['required', 'exists:brands,id'],
            'plate_number' => ['required', 'string', 'max:20', 'unique:cars,plate_number'],
            'model' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'min:1990', 'max:'.date('Y')],
            'daily_price' => ['required', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(CarStatus::values())],
        ];
    }
}
