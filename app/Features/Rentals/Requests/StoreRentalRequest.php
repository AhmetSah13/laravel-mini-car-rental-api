<?php

namespace App\Features\Rentals\Requests;

use App\Shared\Enums\RentalStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Yeni kiralama oluşturma validasyon kuralları.
 * İş mantığı (fiyat hesabı, araç durumu) RentalService'de yapılır.
 */
class StoreRentalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'car_id' => ['required', 'exists:cars,id'],
            'customer_id' => ['required', 'exists:customers,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', Rule::in(RentalStatus::values())],
        ];
    }
}
