<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AccountController extends Controller
{
    public function __construct(protected User $model) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::all();

        return Inertia::render('admin/accounts/index', [
            'roles' => $roles,
        ]);
    }

    public function create(CreateAccountRequest $request)
    {
        try {
            $data = $request->all();
            $user = $this->model->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'email_verified_at' => now(),
            ]);

            $user->assignRole($data['role']);

            return back()->with('success', 'Created account successfully');
        } catch (\Throwable $th) {
            Log::error('Error creating account', $th->getMessage());

            return back()->with('error', 'Database connection error. Please try again later.');
        }
    }

    public function update(UpdateAccountRequest $request, int $id)
    {
        try {
            $data = $request->all();
            $user = $this->model->findOrFail($id);

            $user->update([
                'name' => $data['name'],
                'email' => $data['email'],
                'email_verified_at' => now(),
            ]);

            $user->syncRoles([$data['role']]);

            return back()->with('success', 'Updated account successfully');
        } catch (\Throwable $th) {
            Log::error('Error updating account', $th->getMessage());

            return back()->with('error', 'Database connection error. Please try again later.');
        }
    }
}
