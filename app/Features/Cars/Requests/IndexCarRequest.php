<?php

namespace App\Features\Cars\Requests;

use App\Shared\Enums\CarStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Araç listeleme query parametreleri validasyonu.
 */
class IndexCarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand_id' => ['sometimes', 'integer', 'exists:brands,id'],
            'status' => ['sometimes', Rule::in(CarStatus::values())],
            'min_price' => ['sometimes', 'numeric', 'min:0'],
            'max_price' => ['sometimes', 'numeric', 'min:0', 'gte:min_price'],
            'sort_by' => ['sometimes', 'string', Rule::in(['id', 'daily_price', 'year', 'created_at'])],
            'sort_direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }
}
