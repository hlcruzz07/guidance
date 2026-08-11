<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::updateOrCreate([
            'email' => 'haroldlyndon.cruz@chmsu.edu.ph',
            'avatar' => null,
            'name' => 'Harold Lyndon Cruz',
            'email_verified_at' => Carbon::now(),
        ]);

        $user->assignRole('super_administrator');

        // $admins = User::factory(25)->create();

        // foreach ($admins as $admin) {
        //     $admin->assignRole('administrator');
        // }
    }
}
