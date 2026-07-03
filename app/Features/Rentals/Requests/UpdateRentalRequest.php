<?php

namespace App\Features\Rentals\Requests;

use App\Shared\Enums\RentalStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Kiralama güncelleme validasyon kuralları.
 */
class UpdateRentalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'car_id' => ['sometimes', 'required', 'exists:cars,id'],
            'customer_id' => ['sometimes', 'required', 'exists:customers,id'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', Rule::in(RentalStatus::values())],
        ];
    }
}
