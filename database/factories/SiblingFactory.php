<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Sibling>
 */
class SiblingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'fname' => $this->faker->firstName(),
            'mname' => $this->faker->optional(0.7)->lastName(),
            'lname' => $this->faker->lastName(),
            'birthdate' => $this->faker->dateTimeBetween('-70 years', '-30 years')->format('Y-m-d'),
            'gender' => $this->faker->randomElement(['Male', 'Female']),
            'is_employed' => $this->faker->boolean(35),
        ];
    }

    public function employed(): static
    {
        return $this->state(fn() => ['is_employed' => true]);
    }
}