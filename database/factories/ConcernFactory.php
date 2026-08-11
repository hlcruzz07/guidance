<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Concern>
 */
class ConcernFactory extends Factory
{
    public function definition(): array
    {
        $questions = [
            'Do you have difficulty coping with academic requirements?',
            'Have you experienced any form of bullying?',
            'Do you have concerns about your family situation?',
            'Are you experiencing financial difficulties affecting your studies?',
            'Do you have any health concerns that affect your academics?',
        ];

        $answer = $this->faker->randomElement(['Yes', 'No']);

        return [
            'student_id' => Student::factory(),
            'question' => $this->faker->randomElement($questions),
            'answer' => $answer,
        ];
    }
}