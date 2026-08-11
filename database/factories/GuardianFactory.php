<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Guardian>
 */
class GuardianFactory extends Factory
{
    public function definition(): array
    {
        $religions = ['Roman Catholic', 'Baptist', 'Methodist', 'Pentecostal', 'Evangelical', 'Seventh-day Adventist', 'Iglesia Ni Cristo', 'Sunni Islam', 'Agnostic', 'Atheist'];
        $educAttainments = ['Elementary Graduate', 'High School Graduate', 'Vocational Graduate', 'College Graduate', 'Post Graduate', 'No Formal Education'];
        $occupations = ['Farmer', 'Fisherman', 'Teacher', 'Driver', 'Vendor', 'OFW', 'Government Employee', 'Housewife', 'Business Owner', 'Laborer', 'Unemployed'];
        $lifeStatus = $this->faker->randomElement(['Living', 'Deceased']);
        $isDeceased = $lifeStatus === 'Deceased';

        return [
            'student_id' => Student::factory(),
            'fname' => $this->faker->firstName(),
            'mname' => $this->faker->optional(0.7)->lastName(),
            'lname' => $this->faker->lastName(),
            'suffix' => $this->faker->optional(0.05)->randomElement(['Jr', 'Sr', 'II', 'III']),
            'relationship' => $this->faker->randomElement(['Father', 'Mother', 'Guardian']),
            'phone' => $this->faker->phoneNumber(),
            'birthdate' => $this->faker->dateTimeBetween('-70 years', '-30 years')->format('Y-m-d'),
            'birthplace' => $this->faker->city() . ', ' . $this->faker->country(),
            'religion' => $this->faker->randomElement($religions),
            'nationality' => $this->faker->randomElement(['Filipino', 'American', 'Japanese', 'Korean', 'Chinese']),
            'highest_educ_attainment' => $this->faker->randomElement($educAttainments),
            'life_status' => $lifeStatus,
            'cause_of_death' => $isDeceased ? $this->faker->randomElement(['Illness', 'Accident', 'Natural Causes', 'Heart Attack']) : null,
            'year_of_death' => $isDeceased ? (string) $this->faker->numberBetween(2000, 2024) : null,
            'occupation' => $isDeceased ? null : $this->faker->randomElement($occupations),
        ];
    }

    public function father(): static
    {
        return $this->state(fn() => ['relationship' => 'Father']);
    }

    public function mother(): static
    {
        return $this->state(fn() => ['relationship' => 'Mother']);
    }

    public function guardian(string $label = 'Guardian'): static
    {
        return $this->state(fn() => ['relationship' => $label]);
    }

    public function deceased(): static
    {
        return $this->state(fn() => [
            'life_status' => 'Deceased',
            'cause_of_death' => $this->faker->randomElement(['Illness', 'Accident', 'Natural Causes']),
            'year_of_death' => (string) $this->faker->numberBetween(2000, 2024),
            'occupation' => null,
        ]);
    }
}