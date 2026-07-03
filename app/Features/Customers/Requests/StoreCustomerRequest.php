<?php

namespace App\Features\Customers\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Yeni müşteri oluşturma validasyon kuralları.
 */
class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:customers,email'],
            'phone' => ['nullable', 'string', 'max:30'],
        ];
    }
}
