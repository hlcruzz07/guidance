<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\PsychTest>
 */
class PsychTestFactory extends Factory
{
    public function definition(): array
    {
        $testNames = ['16PF', 'MMPI', 'Career Interest Inventory', 'Emotional Intelligence Test', 'Personality Assessment Inventory', 'Study Habits Inventory'];
        $results = ['Above Average', 'Average', 'Below Average', 'High', 'Moderate', 'Low'];

        return [
            'student_id' => Student::factory(),
            'date_taken' => $this->faker->dateTimeBetween('-3 years', 'now')->format('Y-m-d'),
            'test_name' => $this->faker->randomElement($testNames),
            'test_result' => $this->faker->randomElement($results),
            'interpretation' => $this->faker->sentence(10),
        ];
    }
}