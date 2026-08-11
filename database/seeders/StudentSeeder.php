<?php

namespace Database\Seeders;

use App\Models\Concern;
use App\Models\EquityGroup;
use App\Models\Guardian;
use App\Models\PsychTest;
use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Student::factory()
            ->count(10)
            ->has(PsychTest::factory()->count(fake()->numberBetween(0, 5)))
            ->has(EquityGroup::factory()->count(fake()->numberBetween(0, 5)))
            ->has(Concern::factory()->count(5))
            ->create();

        Student::factory()
            ->has(Guardian::factory()->guardian('Grandmother'))
            ->has(Guardian::factory()->deceased()->father())
            ->has(EquityGroup::factory()->soloParentChild('Mother'))
            ->has(PsychTest::factory()->count(5))
            ->has(Concern::factory()->count(5))
            ->create();


        Student::factory()->count(2000)->create();
    }
}