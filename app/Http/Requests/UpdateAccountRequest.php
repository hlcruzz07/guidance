<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAccountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                function ($attribute, $value, $fail) {

                    $id = $this->route('id');

                    if (User::where('email', $value)->where('id', '!=', $id)->exists()) {
                        $fail('This email is already registered.');
                    }
                },
            ],
            'name' => 'required|string|max:255',
            'role' => 'required|exists:roles,name',

        ];
    }

    public function messages(): array
    {
        return [

            'email.required' => 'Email is required.',
            'email.email' => 'Please provide a valid email address.',

            'name.required' => 'Name is required.',
            'name.string' => 'Name must be a valid string.',
            'name.max' => 'Name may not be greater than 255 characters.',

            'role.required' => 'Role is required.',
            'role.exists' => 'The selected role is invalid.',

        ];
    }
}
