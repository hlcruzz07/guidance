<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Education>
 */
class EducationFactory extends Factory
{
    public function definition(): array
    {
        $startYear = $this->faker->numberBetween(2005, 2022);

        return [
            'student_id' => Student::factory(),
            'education_level' => $this->faker->randomElement([
                'Elementary',
                'Junior High School',
                'Senior High School',
                'Vocational',
                'College',
            ]),
            'school_name' => $this->faker->company() . ' ' . $this->faker->randomElement(['Elementary School', 'National High School', 'Institute', 'College', 'University']),
            'school_type' => $this->faker->randomElement(['Public', 'Private']),
            'year_covered' => $startYear . '-' . ($startYear + 1),
            'honor_receieved' => $this->faker->optional(0.3)->randomElement([
                'With Honors',
                'With High Honors',
                "Dean's Lister",
                'Valedictorian',
                'Salutatorian',
            ]),
        ];
    }

    public function level(string $level): static
    {
        return $this->state(fn() => ['education_level' => $level]);
    }
}