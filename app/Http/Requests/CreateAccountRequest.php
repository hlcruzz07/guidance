<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateAccountRequest extends FormRequest
{
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
                'unique:users,email',
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
            'email.unique' => 'Email is already exist.',

            'name.required' => 'Name is required.',
            'name.string' => 'Name must be a valid string.',
            'name.max' => 'Name may not be greater than 255 characters.',

            'role.required' => 'Role is required.',
            'role.exists' => 'The selected role is invalid.',
        ];
    }
}
